package com.example.audio.Model.Room

import androidx.room.Dao
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface DAO {
//    @Insert
//    suspend fun insertData()

//    @Update
//    suspend fun updateData()

//    @Delete
//    suspend fun deleteData()

    @Query("Select * from TableName")
    fun getData(): Flow<List<Int>>
}