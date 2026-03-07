package com.example.audio.View

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import com.example.audio.Model.Repository.AddC // Make sure this import is correct based on your repo
import com.example.audio.R
import com.example.audio.ViewModel.MyViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddContactScreen(
    viewModel: MyViewModel,
    onClose: () -> Unit = {},
    nav: NavController
) {
    val contextToast = LocalContext.current

    // 1. Listen for Toast messages from the ViewModel
    LaunchedEffect(Unit) {
        viewModel.uiEvent.collect { message ->
            Toast.makeText(contextToast, message, Toast.LENGTH_SHORT).show()
        }
    }

    // 2. Observe the Add Contact network state
    val addContactResult by viewModel.addC.collectAsStateWithLifecycle()

    // 3. 🚀 Navigate back ONLY when the backend returns a Success
    LaunchedEffect(addContactResult) {
        if (addContactResult is AddC.Success) {
            // Go back to the Registry screen
            nav.popBackStack()

            viewModel.clearAddContact()
        }

        else if(addContactResult is AddC.Expired){
            nav.navigate("Sign in"){
                popUpTo("Add person"){
                    inclusive = true
                }
            }
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = stringResource(R.string.add_contact_title),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1A1C1E)
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { nav.popBackStack() }) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_close),
                            contentDescription = stringResource(R.string.close_desc),
                            tint = Color.Black
                        )
                    }
                },
                actions = {
                    TextButton(onClick = {
                        viewModel.AddContact()

                    }) {
                        Text(
                            text = stringResource(R.string.save_button),
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1D82D3)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                )
            )
        },
        containerColor = Color.White
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(24.dp))

            //Photo adding section
            AddPhotoSection()

            Spacer(modifier = Modifier.height(32.dp))

            //name adding textfield
            AddContactInputField(
                label = stringResource(R.string.full_name_label),
                value = viewModel.contactName,
                onValueChange = { viewModel.updateContactName(it) },
                placeholder = stringResource(R.string.full_name_placeholder),
                leadingIcon = {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_person),
                        contentDescription = null,
                        modifier = Modifier.size(20.dp),
                        tint = Color(0xFF1D82D3)
                    )
                }
            )

            Spacer(modifier = Modifier.height(24.dp))

            //Textfield to add phone number
            AddContactInputField(
                label = stringResource(R.string.phone_number_label),
                value = viewModel.contactnumber,
                onValueChange = { viewModel.updateAddContactNumber(it) },
                placeholder = stringResource(R.string.phone_number_placeholder),
                leadingIcon = {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_call),
                        contentDescription = null,
                        modifier = Modifier.size(20.dp),
                        tint = Color(0xFF1D82D3)
                    )
                }
            )

            Spacer(modifier = Modifier.height(24.dp))

            //Button to save
            Button(
                onClick = {
                    viewModel.AddContact()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF1D82D3)
                )
            ) {
                Text(
                    // Update button text while loading
                    text = if (addContactResult is AddC.Loading) "Saving..." else stringResource(R.string.create_contact_button),
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
    }
}

@Composable
fun AddPhotoSection() {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(contentAlignment = Alignment.BottomEnd) {
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .background(Color(0xFF2C3E50), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                // Pin/Person Icon Placeholder
                Icon(
                    painter = painterResource(id = R.drawable.ic_person),
                    contentDescription = null,
                    modifier = Modifier.size(60.dp),
                    tint = Color(0xFFBDC3C7)
                )
            }
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .background(Color(0xFF1D82D3), CircleShape)
                    .padding(8.dp),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_camera),
                    contentDescription = null,
                    tint = Color.White
                )
            }
        }
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = stringResource(R.string.add_photo),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1A1C1E)
        )
    }
}

@Composable
fun AddContactInputField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    leadingIcon: @Composable (() -> Unit)? = null
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (leadingIcon != null) {
                leadingIcon()
                Spacer(modifier = Modifier.width(8.dp))
            }
            Text(
                text = label,
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF44474E)
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            placeholder = {
                Text(text = placeholder, color = Color(0xFFBDC3C7))
            },
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedBorderColor = Color(0xFFE1E2E5),
                focusedBorderColor = Color(0xFF1D82D3),
                unfocusedContainerColor = Color.White,
                focusedContainerColor = Color.White
            ),
            singleLine = true
        )
    }
}