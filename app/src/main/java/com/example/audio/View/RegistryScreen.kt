package com.example.audio.View

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import com.example.audio.CallButton
import com.example.audio.Model.Repository.GetContactsState
import com.example.audio.Model.Retrofit.Requests_And_Responses.Contact
import com.example.audio.R
import com.example.audio.ViewModel.MyViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegistryScreen(
    viewModel: MyViewModel,
    onNavigate: (String) -> Unit,
    nav: NavController,
    modifier: Modifier = Modifier
) {
    // 🚀 Only observe the contacts list!
    val contacts by viewModel.contactsList.collectAsStateWithLifecycle()
    val see by viewModel.getContactsState.collectAsStateWithLifecycle()

    LaunchedEffect (see) {
        if(see is GetContactsState.Expired){
            nav.navigate("Sign in"){
                popUpTo("Registry") {
                    inclusive = true
                }
            }
        }
    }
    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = Color.White,
        topBar = {
            Column {
                TopAppBar(
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.White
                    ),
                    title = {
                        Box(
                            modifier = Modifier.fillMaxWidth(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = stringResource(id = R.string.registry_title),
                                fontWeight = FontWeight.Bold,
                                fontSize = 20.sp,
                                color = Color(0xFF202124)
                            )
                        }
                    },
                    navigationIcon = {
                        IconButton(onClick = { nav.popBackStack() }) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_arrow_back),
                                contentDescription = stringResource(id = R.string.back_desc),
                                tint = Color(0xFF5F6368)
                            )
                        }
                    },
                    actions = {
                        IconButton(onClick = { }) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_search),
                                contentDescription = stringResource(id = R.string.search_desc),
                                tint = Color(0xFF5F6368)
                            )
                        }
                    }
                )
                HorizontalDivider(color = Color(0xFFF1F3F4), thickness = 1.dp)
            }
        },
        bottomBar = {
            Column {
                HorizontalDivider(color = Color(0xFFF1F3F4), thickness = 1.dp)
                RegistryBottomNavigation(onNavigate = { nav.navigate(it) })
            }
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { onNavigate("Add person") },
                containerColor = Color(0xFF1967D2),
                shape = CircleShape,
                modifier = Modifier.size(72.dp),
                elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 4.dp)
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_person_add),
                    contentDescription = stringResource(id = R.string.add_contact_desc),
                    tint = Color.White,
                    modifier = Modifier.size(32.dp)
                )
            }
        }
    ) { innerPadding ->
        PullToRefreshBox(isRefreshing = viewModel.refresh, onRefresh = { viewModel.doRefresh() }) {
            LazyColumn(
                modifier = Modifier
                    .padding(innerPadding)
                    .fillMaxSize()
            ) {
                item {
                    Text(
                        text = stringResource(id = R.string.all_contacts_header),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF9AA0A6),
                        modifier = Modifier.padding(start = 24.dp, top = 24.dp, bottom = 16.dp)
                    )
                }

                // 🚀 Directly render the list
                if (contacts.isEmpty()) {
                    item {
                        // Centered the empty state text so it looks nicer
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.TopCenter
                        ) {
                            Text(
                                text = "No contacts found.",
                                modifier = Modifier.padding(top = 40.dp),
                                color = MaterialTheme.colorScheme.error,
                                fontSize = 16.sp
                            )
                        }
                    }
                } else {
                    items(contacts) { contact ->
                        ContactRow(contact = contact, viewModel = viewModel)
                    }
                }
            }
        }
    }
}

// ... (ContactRow, ContactItem, and RegistryBottomNavigation stay exactly the same below here)

@Composable
fun ContactRow(contact: Contact, modifier: Modifier = Modifier, viewModel: MyViewModel) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Spacer(modifier = Modifier.width(16.dp))

        //Name & type
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = contact.username,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF202124)
            )
            Text(
                text = contact.password,
                fontSize = 14.sp,
                color = Color(0xFF9AA0A6)
            )
        }

        //Delete Button
        IconButton(onClick = {viewModel.deleteContacts(contact.password)}) {
            Icon(imageVector = Icons.Default.Delete,contentDescription = null)
        }
//        Call button
        IconButton(
            onClick = { },
            modifier = Modifier
                .size(48.dp)
                .background(Color(0xFFF1F3F4), CircleShape)
        ) {
            CallButton(contact.password, contact.username)
        }
    }
}

data class ContactItem(val name: String, val type: String, val initials: String, val id: String)

@Composable
fun RegistryBottomNavigation(
    modifier: Modifier = Modifier,
    onNavigate: (String) -> Unit
) {
    NavigationBar(
        modifier = modifier,
        containerColor = Color.White,
        tonalElevation = 0.dp
    ) {
        NavigationBarItem(
            icon = {
                Icon(
                    painter = painterResource(id = R.drawable.ic_call),
                    contentDescription = stringResource(id = R.string.call_tab),
                    modifier = Modifier.size(28.dp)
                )
            },
            label = {
                Text(
                    text = stringResource(id = R.string.call_tab),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            },
            selected = false,
            onClick = { onNavigate("Call person") },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = Color(0xFF1967D2),
                unselectedIconColor = Color(0xFF9AA0A6),
                selectedTextColor = Color(0xFF1967D2),
                unselectedTextColor = Color(0xFF9AA0A6),
                indicatorColor = Color.Transparent
            )
        )
        NavigationBarItem(
            icon = {
                Icon(
                    painter = painterResource(id = R.drawable.ic_registry),
                    contentDescription = stringResource(id = R.string.registry_tab),
                    modifier = Modifier.size(28.dp)
                )
            },
            label = {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = stringResource(id = R.string.registry_tab),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Box(
                        modifier = Modifier
                            .size(5.dp)
                            .background(Color(0xFF1967D2), CircleShape)
                    )
                }
            },
            selected = true,
            onClick = { onNavigate("Registry") },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = Color(0xFF1967D2),
                unselectedIconColor = Color(0xFF9AA0A6),
                selectedTextColor = Color(0xFF1967D2),
                unselectedTextColor = Color(0xFF9AA0A6),
                indicatorColor = Color.Transparent
            )
        )
    }
}
