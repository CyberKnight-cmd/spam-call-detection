package com.example.audio.View.Examples

import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable

@Composable
fun PullToRefresh() {
    PullToRefreshBox(
        isRefreshing = false,
        onRefresh = {},

    ) {
        LazyColumn() {

        }
    }
}