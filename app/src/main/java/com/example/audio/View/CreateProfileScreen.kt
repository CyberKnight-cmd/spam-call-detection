package com.example.audio.View

import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import com.example.audio.Model.Repository.SignUp
import com.example.audio.R
import com.example.audio.RoomApplication
import com.example.audio.ViewModel.MyViewModel
import com.example.audio.ui.theme.SkeletonTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateProfileScreen(
    viewModel: MyViewModel,
    nav: NavController
) {
    val context = LocalContext.current.applicationContext as RoomApplication

    val contextToast = LocalContext.current

    LaunchedEffect(Unit) {
        viewModel.uiEvent.collect { message ->
            Toast.makeText(contextToast, message, Toast.LENGTH_SHORT).show()
        }
    }

    val signUpResult by viewModel.signUp.collectAsStateWithLifecycle()

    //Navigate
// ✅ ADD THIS RIGHT HERE
    LaunchedEffect(signUpResult) {
        if (signUpResult is SignUp.Success) {
            nav.popBackStack()
            viewModel.clearSignUp()
        }
    }


    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            CenterAlignedTopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                ),
                navigationIcon = {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_logo),
                        contentDescription = null,
                        tint = Color.Unspecified,
                        modifier = Modifier
                            .size(32.dp)
                            .padding(start = 10.dp)
                    )
                },
                title = {
                    Text(
                        text = stringResource(R.string.phone_book_app),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF001F3F),
                        modifier = Modifier.padding(end = 32.dp) // Adjust to center roughly if needed, or use Box
                    )
                }
            )
        },
        containerColor = Color(0xFFF8F9FA)
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(32.dp))
            //Icon logo
            ProfileImageSection()

            Spacer(modifier = Modifier.height(24.dp))

            //Basic text
            Text(
                text = stringResource(R.string.create_your_profile),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1A1C1E)
            )

            Spacer(modifier = Modifier.height(8.dp))


            Text(
                text = stringResource(R.string.create_profile_subtitle),
                style = MaterialTheme.typography.bodyMedium,
                color = Color(0xFF74777F),
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 16.dp)
            )

            Spacer(modifier = Modifier.height(32.dp))

            //Username textfield
            InputField(
                label = stringResource(R.string.username_label),
                value = viewModel.username,
                onValueChange = { viewModel.updateUsername(it) },
                placeholder = stringResource(R.string.username_hint),
                helperText = stringResource(R.string.username_helper),
                leadingIcon = {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_person),
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                }
            )

            Spacer(modifier = Modifier.height(24.dp))

            //Phone number textField
            InputField(
                label = stringResource(R.string.phone_number_label),
                value = viewModel.phoneNumber,
                onValueChange = { viewModel.updatePhoneNumber(it) },
                placeholder = stringResource(R.string.phone_number_hint),
                helperText = stringResource(R.string.phone_number_helper),
                leadingIcon = {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_fingerprint),
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                }
            )

            Spacer(modifier = Modifier.height(48.dp))

//            Row(modifier = Modifier.fillMaxWidth().padding(start = 10.dp))
            Text(
                "Already have an account?Login",
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.clickable { nav.popBackStack() })

            Spacer(modifier = Modifier.height(48.dp))

            //Getting info BUTTON
            Button(
                onClick = {
                    if (viewModel.username.isNotEmpty() && viewModel.phoneNumber.isNotEmpty()) {
                        viewModel.signUp()
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF1D82D3)
                )
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = if (signUpResult is SignUp.Loading) "Verifying..." else stringResource(
                            R.string.Sign_up
                        ),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Icon(
                        painter = painterResource(id = R.drawable.ic_arrow_forward),
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun ProfileImageSection() {
    Box(
        modifier = Modifier
            .size(120.dp)
            .background(Color(0xFFE1F0FF), CircleShape),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            painter = painterResource(id = R.drawable.ic_person),
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = Color(0xFF1D82D3)
        )
    }
}

@Composable
fun InputField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    helperText: String,
    leadingIcon: @Composable (() -> Unit)? = null
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelLarge,
            fontWeight = FontWeight.Medium,
            color = Color(0xFF44474E),
            modifier = Modifier.padding(bottom = 8.dp)
        )
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            placeholder = {
                Text(text = placeholder, color = Color(0xFF9AA0A6))
            },
            leadingIcon = leadingIcon,
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedBorderColor = Color(0xFFE1E2E5),
                focusedBorderColor = Color(0xFF1D82D3),
                unfocusedContainerColor = Color.White,
                focusedContainerColor = Color.White
            ),
            singleLine = true
        )
        Text(
            text = helperText,
            style = MaterialTheme.typography.bodySmall,
            color = Color(0xFF74777F),
            modifier = Modifier.padding(top = 8.dp)
        )
    }
}