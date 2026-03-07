package com.example.audio.Model.Room

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "TableName")
class Tables {
    @PrimaryKey(autoGenerate = true)
    var id: Int = 0
}
