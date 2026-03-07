package com.example.audio.View

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularWavyProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import com.example.audio.RoomApplication
import com.example.audio.ViewModel.MyViewModel
import com.example.audio.ViewModel.Verify

@OptIn(ExperimentalMaterial3ExpressiveApi::class)
@Composable
fun SplashScreen(viewModel: MyViewModel, nav: NavController) {
    val verify by viewModel.verify.collectAsStateWithLifecycle()
    val context = LocalContext.current.applicationContext as RoomApplication

    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        LaunchedEffect(verify) {
            when (val flag = verify) {
                is Verify.Success -> {

                    context.initZegoCalling(
                        currentUserID = viewModel.myCallNumber,
                        currentUserName = viewModel.myUsername
                    )

                    nav.navigate("Call person") {
                        popUpTo("SplashScreen") {
                            inclusive = true
                        }
                    }
                }

                is Verify.Failure -> {
                    nav.navigate("Sign in") {
                        popUpTo("SplashScreen") {
                            inclusive = true
                        }
                    }
                }

                else -> {}
            }
        }

        when (val flag = verify) {
            is Verify.Loading -> {
                CircularWavyProgressIndicator()
            }

            else -> {}
        }
    }
}