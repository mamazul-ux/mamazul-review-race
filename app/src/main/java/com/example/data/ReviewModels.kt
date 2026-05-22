package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "review_mentions")
data class ReviewMention(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val serverName: String,
    val monthStr: String, // e.g. "2026-05"
    val year: Int,
    val monthValue: Int, // e.g. 1 to 12
    val mentionsCount: Int
)

@Entity(tableName = "sync_metadata")
data class SyncMetadata(
    @PrimaryKey val id: Int = 1,
    val spreadsheetId: String,
    val sheetName: String,
    val lastSyncTime: Long = 0L,
    val lastSyncSuccess: Boolean = false,
    val lastSyncMessage: String = ""
)
