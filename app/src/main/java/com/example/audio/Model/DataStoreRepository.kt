package com.example.audio.Model
import android.content.Context
import androidx.datastore.preferences.core.byteArrayPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.example.audio.Model.Repository.TinkCryptoManager
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "user_session")

class DataStoreRepository(
    private val context: Context,
    private val tinkCryptoManager: TinkCryptoManager
) {


    // Store encrypted data as a ByteArray
    private val SECURE_USERNAME = byteArrayPreferencesKey("secure_username")
    private val SECURE_PHONE_NUMBER = byteArrayPreferencesKey("secure_phone_number")
    private val SECURE_ACCESS_TOKEN = byteArrayPreferencesKey("secure_access_token")
    private val SECURE_REFRESH_TOKEN = byteArrayPreferencesKey("secure_refresh_token")

    suspend fun saveSession(
        username: String,
        phone_number: String,
        accessToken: String,
        refreshToken: String
    ) {

        val encryptedUsername = tinkCryptoManager.encrypt(username)
        val encryptedPhoneNumber = tinkCryptoManager.encrypt(phone_number)
        val encryptedAccessToken = tinkCryptoManager.encrypt(accessToken)
        val encryptedRefreshToken = tinkCryptoManager.encrypt(refreshToken)

        context.dataStore.edit { prefs ->
            prefs[SECURE_USERNAME] = encryptedUsername
            prefs[SECURE_PHONE_NUMBER] = encryptedPhoneNumber
            prefs[SECURE_ACCESS_TOKEN] = encryptedAccessToken
            prefs[SECURE_REFRESH_TOKEN] = encryptedRefreshToken
        }
    }

    fun getUsername(): Flow<String?> {
        return context.dataStore.data.map { prefs ->
            val encryptedBytes = prefs[SECURE_USERNAME]

            encryptedBytes?.let {
                try {
                    tinkCryptoManager.decrypt(it)
                } catch (e: Exception) {
                    null
                }
            }
        }
    }

    fun getAccessToken(): Flow<String?> {
        return context.dataStore.data.map { prefs ->

            val encryptedBytes = prefs[SECURE_ACCESS_TOKEN]

            encryptedBytes?.let {
                try {
                    tinkCryptoManager.decrypt(it)
                } catch (e: Exception) {
                    null
                }
            }
        }
    }

    fun getRefreshToken(): Flow<String?> {
        return context.dataStore.data.map { prefs ->

            val encryptedBytes = prefs[SECURE_REFRESH_TOKEN]

            encryptedBytes?.let {
                try {
                    tinkCryptoManager.decrypt(it)
                } catch (e: Exception) {
                    null
                }
            }
        }
    }

    fun getPhoneNumber(): Flow<String?> {
        return context.dataStore.data.map { prefs ->

            val encryptedBytes = prefs[SECURE_PHONE_NUMBER]

            encryptedBytes?.let {
                try {
                    tinkCryptoManager.decrypt(it)
                } catch (e: Exception) {
                    null
                }
            }
        }
    }

    suspend fun clearUser() {
        context.dataStore.edit { prefs ->
            prefs.remove(SECURE_USERNAME)
            prefs.remove(SECURE_PHONE_NUMBER)
            prefs.remove(SECURE_ACCESS_TOKEN)
            prefs.remove(SECURE_REFRESH_TOKEN)
        }
    }
}