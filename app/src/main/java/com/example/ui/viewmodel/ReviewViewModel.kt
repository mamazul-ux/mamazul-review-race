package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.*
import com.example.network.SheetsFetcher
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.Calendar

class ReviewViewModel(application: Application) : AndroidViewModel(application) {
    private val database = AppDatabase.getDatabase(application)
    private val repository = ReviewRepository(database.reviewMentionDao(), database.syncMetadataDao())

    val DEFAULT_SPREADSHEET_ID = "1tcZ9rvGwqkzOPEESU4dGMEx0hxxXThQBNg6NM7wU6kA"
    val DEFAULT_SHEET_NAME = "Monthly Totals"

    // Sheet address configuration
    private val _spreadsheetId = MutableStateFlow(DEFAULT_SPREADSHEET_ID)
    val spreadsheetId = _spreadsheetId.asStateFlow()

    private val _sheetName = MutableStateFlow(DEFAULT_SHEET_NAME)
    val sheetName = _sheetName.asStateFlow()

    // Main mentions cache
    val allMentions: StateFlow<List<ReviewMention>> = repository.allMentions
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Synchronization updates status
    val syncMetadata: StateFlow<SyncMetadata?> = repository.syncMetadata
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    private val _isSyncing = MutableStateFlow(false)
    val isSyncing = _isSyncing.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage = _errorMessage.asStateFlow()

    // Dashboard time filters
    private val _selectedMonth = MutableStateFlow(5) // Default to May
    val selectedMonth = _selectedMonth.asStateFlow()

    private val _selectedYear = MutableStateFlow(2026) // Default to 2026
    val selectedYear = _selectedYear.asStateFlow()

    init {
        viewModelScope.launch {
            // Load saved spreadsheet connection context if exists
            val savedMeta = repository.getSyncMetadataDirect()
            if (savedMeta != null) {
                _spreadsheetId.value = savedMeta.spreadsheetId
                _sheetName.value = savedMeta.sheetName
            } else {
                repository.saveSyncMetadata(
                    SyncMetadata(
                        spreadsheetId = DEFAULT_SPREADSHEET_ID,
                        sheetName = DEFAULT_SHEET_NAME
                    )
                )
            }
        }

        // Trigger automatic loader if cache is empty on launch
        viewModelScope.launch {
            allMentions.collect { mentions ->
                if (mentions.isEmpty() && !_isSyncing.value) {
                    syncFromSheet()
                }
            }
        }
    }

    fun updateSelectedMonth(month: Int) {
        _selectedMonth.value = month
    }

    fun updateSelectedYear(year: Int) {
        _selectedYear.value = year
    }

    fun updateSettings(sheetId: String, tab: String) {
        viewModelScope.launch {
            _spreadsheetId.value = sheetId
            _sheetName.value = tab
            val currentMeta = repository.getSyncMetadataDirect() ?: SyncMetadata(spreadsheetId = sheetId, sheetName = tab)
            repository.saveSyncMetadata(
                currentMeta.copy(spreadsheetId = sheetId, sheetName = tab)
            )
        }
    }

    fun resetSettings() {
        updateSettings(DEFAULT_SPREADSHEET_ID, DEFAULT_SHEET_NAME)
    }

    fun syncFromSheet() {
        if (_isSyncing.value) return
        viewModelScope.launch {
            _isSyncing.value = true
            _errorMessage.value = null
            try {
                val sheetId = _spreadsheetId.value
                val tab = _sheetName.value
                val parsedData = SheetsFetcher.fetchSheetData(sheetId, tab)
                
                if (parsedData.isEmpty()) {
                    throw Exception("No entries found in sheet '$tab'. Check tab sharing settings.")
                }
                
                repository.saveMentions(parsedData)
                
                val currentMeta = repository.getSyncMetadataDirect() ?: SyncMetadata(spreadsheetId = sheetId, sheetName = tab)
                repository.saveSyncMetadata(
                    currentMeta.copy(
                        lastSyncTime = System.currentTimeMillis(),
                        lastSyncSuccess = true,
                        lastSyncMessage = "Successfully synchronized ${parsedData.size} mentions!"
                    )
                )
            } catch (e: Exception) {
                val errorMsg = e.localizedMessage ?: "Unknown synchronization failure."
                _errorMessage.value = errorMsg
                val currentMeta = repository.getSyncMetadataDirect() ?: SyncMetadata(spreadsheetId = _spreadsheetId.value, sheetName = _sheetName.value)
                repository.saveSyncMetadata(
                    currentMeta.copy(
                        lastSyncTime = System.currentTimeMillis(),
                        lastSyncSuccess = false,
                        lastSyncMessage = "Sync failed: $errorMsg"
                    )
                )
            } finally {
                _isSyncing.value = false
            }
        }
    }
}
