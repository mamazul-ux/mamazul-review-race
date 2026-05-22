package com.example.data

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ReviewMentionDao {
    @Query("SELECT * FROM review_mentions")
    fun getAllMentions(): Flow<List<ReviewMention>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(mentions: List<ReviewMention>)

    @Query("DELETE FROM review_mentions")
    suspend fun deleteAll()
}

@Dao
interface SyncMetadataDao {
    @Query("SELECT * FROM sync_metadata WHERE id = 1")
    fun getSyncMetadata(): Flow<SyncMetadata?>

    @Query("SELECT * FROM sync_metadata WHERE id = 1")
    suspend fun getSyncMetadataDirect(): SyncMetadata?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(metadata: SyncMetadata)
}

@Database(entities = [ReviewMention::class, SyncMetadata::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun reviewMentionDao(): ReviewMentionDao
    abstract fun syncMetadataDao(): SyncMetadataDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "mamazul_race_database"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}

class ReviewRepository(
    private val reviewMentionDao: ReviewMentionDao,
    private val syncMetadataDao: SyncMetadataDao
) {
    val allMentions: Flow<List<ReviewMention>> = reviewMentionDao.getAllMentions()
    val syncMetadata: Flow<SyncMetadata?> = syncMetadataDao.getSyncMetadata()

    suspend fun saveMentions(mentions: List<ReviewMention>) {
        reviewMentionDao.deleteAll()
        reviewMentionDao.insertAll(mentions)
    }

    suspend fun saveSyncMetadata(metadata: SyncMetadata) {
        syncMetadataDao.insertOrUpdate(metadata)
    }

    suspend fun getSyncMetadataDirect(): SyncMetadata? {
        return syncMetadataDao.getSyncMetadataDirect()
    }
}
