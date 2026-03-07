package com.example.audio.ViewModel

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.audio.Model.DataStoreRepository
import com.example.audio.Model.Repository.AddC
import com.example.audio.Model.Repository.GetContactsState
import com.example.audio.Model.Repository.NetworkRepository
import com.example.audio.Model.Repository.RoomRepository
import com.example.audio.Model.Repository.SignIn
import com.example.audio.Model.Repository.SignUp
import com.example.audio.Model.Retrofit.Requests_And_Responses.AddContactRequest
import com.example.audio.Model.Retrofit.Requests_And_Responses.Contact // Make sure to import this!
import com.example.audio.Model.Retrofit.Requests_And_Responses.DeleteContactRequest
import com.example.audio.Model.Retrofit.Requests_And_Responses.GetContactsRequest
import com.example.audio.Model.Retrofit.Requests_And_Responses.LoginRequest
import com.example.audio.Model.Retrofit.Requests_And_Responses.SignupRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class MyViewModel(
    val roomRepo: RoomRepository,
    val networkRepo: NetworkRepository,
    val dataStoreRepo: DataStoreRepository
) : ViewModel() {
    //Splash Screen
    init {
        verifyStatus()
    }

    val _verify = MutableStateFlow<Verify>(Verify.Loading)
    val verify = _verify

    fun verifyStatus() {
        viewModelScope.launch {
            val accessToken = dataStoreRepo.getAccessToken().first()
            val userName = dataStoreRepo.getUsername().first()
            val phoneNumber = dataStoreRepo.getPhoneNumber().first()

            Log.d("Srijan", accessToken.toString())
            Log.d("Srijan", userName.toString())
            Log.d("Srijan", phoneNumber.toString())

            if (accessToken != null && userName != null && phoneNumber != null) {
                _verify.value = Verify.Success

                //Put the username nad password for register in to Zego
                updateMyUsername(userName)
                updateMyCallNumber(phoneNumber)

                //Getching the user contact list
//                fetchContacts()

            } else {
                _verify.value = Verify.Failure
            }
        }
    }

    // Showing toast
    private val _uiEvent = MutableSharedFlow<String>()
    val uiEvent = _uiEvent.asSharedFlow()

    fun showToast(message: String) {
        viewModelScope.launch {
            _uiEvent.emit(message)
        }
    }

    // 🚀 NEW: Dedicated StateFlow for your contacts list
    private val _contactsList = MutableStateFlow<List<Contact>>(emptyList())
    val contactsList: StateFlow<List<Contact>> = _contactsList

    // Response from the backend
    var response by mutableStateOf("")
    fun updateResponse(response: String) {
        this.response = response
    }

    // Sign up variables
    var username by mutableStateOf("")
    fun updateUsername(text: String) {
        username = text
    }

    var phoneNumber by mutableStateOf("")
    fun updatePhoneNumber(no: String) {
        phoneNumber = no
    }

    // Sign in variables
    var usernameSignIn by mutableStateOf("")
    fun updateUsernameSignIn(text: String) {
        usernameSignIn = text
    }

    var phoneNumberSignIn by mutableStateOf("")
    fun updatePhoneNumberSignIn(no: String) {
        phoneNumberSignIn = no
    }

    // Dial page variables
    var toCallName by mutableStateOf("")
    fun updateToCallName(no: String) {
        toCallName = no
    }

    var toCallNumber by mutableStateOf("")
    fun updateToCallNumber(no: String) {
        toCallNumber = no
    }

    // My own registration to Zego
    var myUsername by mutableStateOf("")
    fun updateMyUsername(no: String) {
        myUsername = no
    }

    var myCallNumber by mutableStateOf("")
    fun updateMyCallNumber(no: String) {
        myCallNumber = no
    }

    // Add contacts variables
    var contactName by mutableStateOf("")
    fun updateContactName(name: String) {
        contactName = name
    }

    var contactnumber by mutableStateOf("")
    fun updateAddContactNumber(no: String) {
        contactnumber = no
    }

    // --- NETWORK CALLS ---

    // Sign up
    val _signUp = MutableStateFlow<SignUp?>(null)
    val signUp: StateFlow<SignUp?> = _signUp

    fun signUp() {
        if (username.isNotEmpty() && username.isNotBlank() && phoneNumber.isNotEmpty() && phoneNumber.isNotBlank()) {
            viewModelScope.launch(Dispatchers.IO) {
                _signUp.value = SignUp.Loading

                val request = SignupRequest(username, phoneNumber)
                val signUpResponse = networkRepo.signUp(request)
                _signUp.value = signUpResponse

                when (val flag = signUpResponse) {
                    is SignUp.Success -> showToast(flag.success.message)
                    is SignUp.Error -> showToast(flag.error)
                    else -> {}
                }
            }
        }
    }

    fun clearSignUp() {
        updateUsername("")
        updatePhoneNumber("")
        _signUp.value = null
    }

    // Login
    val _login = MutableStateFlow<SignIn?>(null)
    val login: StateFlow<SignIn?> = _login

    fun signIn() {
        if (usernameSignIn.isNotEmpty() && usernameSignIn.isNotBlank() && phoneNumberSignIn.isNotEmpty() && phoneNumberSignIn.isNotBlank()) {
            viewModelScope.launch(Dispatchers.IO) {
                _login.value = SignIn.Loading

                val request = LoginRequest(usernameSignIn, phoneNumberSignIn)

                val signInResponse = networkRepo.signIn(request)


                when (val flag = signInResponse) {
                    is SignIn.Success -> {

                        //Saving the tokens
                        dataStoreRepo.saveSession(
                            signInResponse.success.user.username,
                            signInResponse.success.user.phone_number,
                            signInResponse.success.accessToken,
                            signInResponse.success.refreshToken
                        )
                        //Put the username nad password for registertin to Zego
                        updateMyUsername(signInResponse.success.user.username)
                        updateMyCallNumber(signInResponse.success.user.phone_number)

                        showToast("Welcome ${signInResponse.success.user.username}")
                        // 🚀 NEW: Update the master contacts list upon successful login
                        _contactsList.value = flag.success.user.listOfContacts
                    }

                    is SignIn.Error -> {
                        showToast(flag.error)
                    }

                    else -> {}
                }

                _login.value = signInResponse
            }
        }
    }

    fun clearSignIn() {
        _login.value = null
    }

    // Add Contact
    val _addC = MutableStateFlow<AddC?>(null)
    val addC: StateFlow<AddC?> = _addC

    fun AddContact() {
        if (contactName.isNotEmpty() && contactName.isNotBlank() && contactnumber.isNotEmpty() && contactnumber.isNotBlank()) {
            viewModelScope.launch(Dispatchers.IO) {
                _addC.value = AddC.Loading
                val request =
                    AddContactRequest(myCallNumber, contactName, contactnumber)
                val addContactResponse = networkRepo.AddC(request)
                _addC.value = addContactResponse

                when (val flag = addContactResponse) {
                    is AddC.Success -> {
                        showToast(flag.success.message)
                        // 🚀 NEW: Update the master contacts list upon successfully adding someone
                        _contactsList.value = flag.success.listOfContacts

                        clearAddContact()
                    }

                    is AddC.Expired -> {
                        dataStoreRepo.clearUser()
                    }

                    is AddC.Error -> showToast(flag.error)
                    else -> {}
                }
            }
        }else{
            showToast("Fill up credentials")
        }
    }

    fun clearAddContact() {
        _addC.value = null
        updateContactName("")
        updateAddContactNumber("")
    }

    // Get Contacts
    var refresh by mutableStateOf(false)

    fun doRefresh() {
        refresh = true
        fetchContacts()
        refresh = false
    }


    private val _getContactsState = MutableStateFlow<GetContactsState?>(null)
    val getContactsState: StateFlow<GetContactsState?> = _getContactsState

    fun fetchContacts() {
        Log.d("Srijan", "No")

        // We don't want to make an empty call!
        if (myCallNumber.isNotEmpty() && myCallNumber.isNotBlank()) {
            Log.d("Srijan", myCallNumber)
            viewModelScope.launch(Dispatchers.IO) {
                _getContactsState.value = GetContactsState.Loading

                val request = GetContactsRequest(myCallNumber)
                val response = networkRepo.getContacts(request)

                _getContactsState.value = response

                when (val flag = response) {
                    is GetContactsState.Success -> {
                        // 🚀 SUCCESS! Update the master contacts list for the RegistryScreen!
                        _contactsList.value = flag.success.listOfContacts
                    }

                    is GetContactsState.Expired -> {
                        dataStoreRepo.clearUser()
                    }

                    is GetContactsState.Error -> {
                        showToast(flag.error)
                    }

                    else -> {}
                }
            }
        }
    }

    fun deleteContacts(contactNumber: String) {
        Log.d("Srijan", "No")

        // We don't want to make an empty call!
        if (myCallNumber.isNotEmpty() && myCallNumber.isNotBlank()) {
            Log.d("Srijan", myCallNumber)
            viewModelScope.launch(Dispatchers.IO) {
                _getContactsState.value = GetContactsState.Loading

                val request = DeleteContactRequest(myCallNumber,contactNumber)
                val response = networkRepo.deleteContacts(request)

                _getContactsState.value = response

                when (val flag = response) {
                    is GetContactsState.Success -> {
                        // 🚀 SUCCESS! Update the master contacts list for the RegistryScreen!
                        _contactsList.value = flag.success.listOfContacts
                    }

                    is GetContactsState.Expired -> {
                        dataStoreRepo.clearUser()
                    }

                    is GetContactsState.Error -> {
                        showToast(flag.error)
                    }

                    else -> {}
                }
            }
        }
    }

    fun LogOut() {
        viewModelScope.launch { dataStoreRepo.clearUser() }
    }
//

//    //Refresh
//    fun refresh(){
//        networkRepo.
//    }
}

sealed interface Verify {
    data object Loading : Verify
    data object Success : Verify
    data object Failure : Verify
}