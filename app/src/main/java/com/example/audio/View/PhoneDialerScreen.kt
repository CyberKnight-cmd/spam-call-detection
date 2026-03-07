package com.example.audio.View

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.audio.CallButton
import com.example.audio.R
import com.example.audio.ViewModel.MyViewModel
import com.example.audio.ui.theme.SkeletonTheme
import androidx.compose.ui.platform.LocalContext // Make sure to import this!
import com.example.audio.RoomApplication

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PhoneDialerScreen(
    viewModel: MyViewModel,
    onNavigateAdd: (String) -> Unit,
    nav: NavController
) {
    val context = LocalContext.current
    val zegoContext = LocalContext.current.applicationContext as RoomApplication


    Scaffold(
        modifier = Modifier.fillMaxSize(),
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
                                text = stringResource(id = R.string.phone_title),
                                fontWeight = FontWeight.Bold,
                                fontSize = 20.sp,
                                color = Color(0xFF202124)
                            )
                        }
                    },
                    navigationIcon = {
                        IconButton(onClick = {
                            viewModel.LogOut()

//                            zegoContext.disconnectZego()

                            nav.navigate("Sign in") {
                                popUpTo("Call person"){
                                    inclusive = true
                                }
                            }
                        }) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_menu),
                                contentDescription = "Menu",
                                tint = Color(0xFF5F6368)
                            )
                        }
                    },
                    actions = {
                        IconButton(onClick = { onNavigateAdd("Add person") }) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_person_add),
                                contentDescription = "Add Contact",
                                tint = Color(0xFF1967D2)
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
                DialerBottomNavigation(onNavigate = {
                    nav.navigate(it) {
                        popUpTo(it) {
                            inclusive = true
                        }
                    }
                })
            }
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = {},
                containerColor = Color(0xFF1967D2),
                shape = CircleShape,
                modifier = Modifier.size(80.dp),
                elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 4.dp)
            ) {
                CallButton(viewModel.toCallNumber, "Unkhown Number")
            }
        },
        floatingActionButtonPosition = FabPosition.Center
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(48.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier.fillMaxWidth()
            ) {
                //Text field for taking numbers
                Text(
                    text = viewModel.toCallNumber.ifEmpty { stringResource(id = R.string.enter_number_hint) },
                    fontSize = 44.sp,
                    fontWeight = FontWeight.Normal,
                    color = if (viewModel.toCallNumber.isEmpty()) Color(0xFFD1D9E6) else Color(0xFF3C4043),
                    textAlign = TextAlign.Center
                )
                if (viewModel.toCallNumber.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .width(2.dp)
                            .height(44.dp)
                            .background(Color(0xFF202124))
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = stringResource(id = R.string.unknown_contact),
                fontSize = 16.sp,
                color = Color(0xFF70757A),
                fontWeight = FontWeight.Medium
            )


            //
            // Grab the vibrator service appropriately based on Android version
            val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager =
                    context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                vibratorManager.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            }

            LaunchedEffect(viewModel.response) {
                // Notice: I added .trim().uppercase() just in case the backend sends "Scam " or "scam"
                if (viewModel.response.trim().uppercase() == "SCAM") {
                    val pattern = longArrayOf(
                        0,   // start immediately
                        600, // vibrate 600ms
                        0  // pause 300ms
                    )

                    val amplitudes = intArrayOf(
                        0,    // no vibration at start
                        255,  // MAX POWER (1–255)
                        0     // pause
                    )

                    vibrator.vibrate(
                        VibrationEffect.createWaveform(pattern, amplitudes, 0)
                    )
                } else {
                    vibrator?.cancel()
                }
            }

// 🚀 The perfect place for your response text!
            if (viewModel.response.isNotEmpty()) {
                Spacer(modifier = Modifier.height(16.dp))
                Surface(
                    color = Color(0xFFE8F0FE),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.padding(horizontal = 32.dp)
                ) {
                    // 🚀 2. CLEAN THIS UP: Just pass the text normally
                    Text(
                        text = viewModel.response,
                        fontSize = 14.sp,
                        color = Color(0xFF1967D2),
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                        textAlign = TextAlign.Center
                    )
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            //Dialer pad
            DialPad(
                onNumberClick = { number ->
                    if (viewModel.toCallNumber.length <= 10) {
                        viewModel.toCallNumber += number
                    }
                }
            )

            Spacer(modifier = Modifier.height(40.dp))

            //FAB for calling
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(100.dp),
                contentAlignment = Alignment.Center
            ) {


                // Back button to delete one number
                if (viewModel.toCallNumber.isNotEmpty()) {
                    IconButton(
                        onClick = { viewModel.toCallNumber = viewModel.toCallNumber.dropLast(1) },
                        modifier = Modifier
                            .align(Alignment.CenterEnd)
                            .padding(end = 40.dp)
                            .size(56.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_backspace),
                            contentDescription = "Delete number",
                            tint = Color(0xFF5F6368),
                            modifier = Modifier.size(32.dp)
                        )
                    }
                }
            }



            Spacer(modifier = Modifier.height(48.dp))

//            Box(modifier = Modifier.fillMaxWidth(),
//                contentAlignment = Alignment.BottomCenter
//            ) {
//                Text(viewModel.response)
//            }
        }
    }
}

@Composable
fun DialPad(onNumberClick: (String) -> Unit, modifier: Modifier = Modifier) {
    val keys = listOf(
        DialKey("1", ""),
        DialKey("2", "A B C"),
        DialKey("3", "D E F"),
        DialKey("4", "G H I"),
        DialKey("5", "J K L"),
        DialKey("6", "M N O"),
        DialKey("7", "P Q R S"),
        DialKey("8", "T U V"),
        DialKey("9", "W X Y Z"),
        DialKey("*", ""),
        DialKey("0", "+"),
        DialKey("#", "")
    )

    LazyVerticalGrid(
        columns = GridCells.Fixed(3),
        modifier = modifier
            .padding(horizontal = 48.dp)
            .fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(24.dp),
        horizontalArrangement = Arrangement.spacedBy(24.dp),
        userScrollEnabled = false
    ) {
        items(keys) { key ->
            DialButton(key = key, onClick = { onNumberClick(key.number) })
        }
    }
}

@Composable
fun DialButton(key: DialKey, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .clip(CircleShape)
            .clickable(onClick = onClick)
            .padding(vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = key.number,
            fontSize = 36.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF202124)
        )
        Box(modifier = Modifier.height(14.dp)) {
            if (key.number == "0") {
                Text(
                    text = "+",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Normal,
                    color = Color(0xFF9AA0A6)
                )
            }
        }
    }
}

data class DialKey(val number: String, val letters: String)

@Composable
fun DialerBottomNavigation(
    modifier: Modifier = Modifier, onNavigate: (String) -> Unit
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
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = stringResource(id = R.string.call_tab),
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
                Text(
                    text = stringResource(id = R.string.registry_tab),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            },
            selected = false,
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

