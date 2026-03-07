package com.example.audio

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.runtime.Composable
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.audio.Model.DataStoreRepository
import com.example.audio.Model.Repository.NetworkRepository
import com.example.audio.Model.Repository.RoomRepository
import com.example.audio.Model.Repository.TinkCryptoManager
import com.example.audio.Model.Retrofit.RetrofitClient
import com.example.audio.Model.Room.DAO
import com.example.audio.Model.Room.NoteDatabase
import com.example.audio.View.AddContactScreen
import com.example.audio.View.CreateProfileScreen
import com.example.audio.View.PhoneDialerScreen
import com.example.audio.View.RegistryScreen
import com.example.audio.View.SplashScreen
import com.example.audio.View.signIn
import com.example.audio.ViewModel.MyViewModel
import com.example.audio.ui.theme.SkeletonTheme
import com.zegocloud.uikit.prebuilt.call.invite.widget.ZegoSendCallInvitationButton
import com.zegocloud.uikit.service.defines.ZegoUIKitUser

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val database = NoteDatabase.getDatabase(this)
        val roomRepo = RoomRepository(database.dao())

        val tink = TinkCryptoManager(applicationContext)
        val dataStoreRepo = DataStoreRepository(applicationContext, tink)

        val retrofitClient = RetrofitClient(dataStoreRepo)

        val networkRepo = NetworkRepository(retrofitClient)

        val viewModel: MyViewModel by viewModels {
            ViewModelCopyFactory(database.dao(), roomRepo, networkRepo,dataStoreRepo)
        }

        val myApp = application as RoomApplication
        myApp.onMessageCallback = { incomingText ->
            viewModel.updateResponse(incomingText) // Make sure this matches your ViewModel!
        }

//        viewModel.verifyStatus()

        setContent {
            SkeletonTheme {
                // Pass the dynamic start destination to your NavHost!
                MainContent(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun MainContent(viewModel: MyViewModel) {
    val nav = rememberNavController()

    NavHost(startDestination = "SplashScreen", navController = nav) {

        composable(route = "SplashScreen") {
            SplashScreen(viewModel, nav)
        }


        composable(route = "Sign up") {
            CreateProfileScreen(viewModel, nav)
        }

        composable(route = "Call person") {
            PhoneDialerScreen(viewModel, { nav.navigate(it) }, nav)
        }

        composable(route = "Registry") {
            RegistryScreen(viewModel, { nav.navigate(it) }, nav)
        }

        composable(route = "Add person") {
            AddContactScreen(viewModel, nav = nav)
        }

        composable(route = "Sign in") {
            signIn(viewModel, onSignin = { nav.navigate(it){
                popUpTo("Sign in"){
                    inclusive = true
                }
            } }, nav)
        }
    }
}

@Composable
fun CallButton(targetUserID: String, targetUserName: String) {
    AndroidView(
        factory = { context ->
            ZegoSendCallInvitationButton(context).apply {
                setIsVideoCall(false) // Voice-only call
                resourceID = "zego_uikit_call"

                if (targetUserID.isNotEmpty()) {
                    setInvitees(listOf(ZegoUIKitUser(targetUserID, targetUserName)))
                }
            }
        },
        update = { view ->
            // Re-binds the button if the user types a new ID into a TextField
            if (targetUserID.isNotEmpty()) {
                view.setInvitees(listOf(ZegoUIKitUser(targetUserID, targetUserName)))
            } else {
                view.setInvitees(emptyList())
            }
        }
    )
}

//Factory
class ViewModelCopyFactory(
    private val dao: DAO,
    private val roomRepo: RoomRepository,
    private val networkRepo: NetworkRepository,
    val dataStoreRepo: DataStoreRepository,
    ) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(MyViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return MyViewModel(roomRepo, networkRepo,dataStoreRepo) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
