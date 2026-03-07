package com.example.audio.View

import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import androidx.room.DatabaseView
import com.example.audio.Model.Repository.SignIn
import com.example.audio.RoomApplication
import com.example.audio.ViewModel.MyViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun signIn(viewModel: MyViewModel, onSignin: (String) -> Unit,nav: NavController) {
    val context = LocalContext.current.applicationContext as RoomApplication
    val contextToast = LocalContext.current

    LaunchedEffect(Unit) {
        viewModel.uiEvent.collect { message ->
            Toast.makeText(contextToast, message, Toast.LENGTH_SHORT).show()
        }
    }

    val signInResult by viewModel.login.collectAsStateWithLifecycle()

    // 🚀 WATCH FOR SUCCESS TO TRIGGER NAVIGATION AND SAVING
    LaunchedEffect(signInResult) {
        if (signInResult is SignIn.Success) {
            onSignin("Call person")

            context.initZegoCalling(
                currentUserID = viewModel.myCallNumber,
                currentUserName = viewModel.myUsername
            )

            viewModel.clearSignIn()
        }
    }

    Scaffold(
        topBar = { CenterAlignedTopAppBar(title = { Text("Sign in") }) }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(it),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Text("Username")
            TextField(
                value = viewModel.usernameSignIn,
                onValueChange = { viewModel.updateUsernameSignIn(it) },
                modifier = Modifier.padding(horizontal = 10.dp)
            )

            Text("Password")
            TextField(
                value = viewModel.phoneNumberSignIn,
                onValueChange = { viewModel.updatePhoneNumberSignIn(it) },
                modifier = Modifier.padding(horizontal = 10.dp)
            )

            Text("didn't sign in yet? Sign Up", textDecoration = TextDecoration.Underline,modifier = Modifier.clickable{ nav.navigate("Sign up") })

            Button(onClick = {
                // 🚀 ONLY TRIGGER THE VIEWMODEL HERE
                if (viewModel.usernameSignIn.isNotEmpty() && viewModel.phoneNumberSignIn.isNotEmpty()) {
                    viewModel.signIn()
                }
            }) {
                Text(
                    text = if (signInResult is SignIn.Loading) "Verifying..." else "Login"
                )
            }
        }
    }
}