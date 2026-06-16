package zelimkhan.magomadov.vipmed.core.network

import android.content.Context
import android.content.SharedPreferences

class TokenManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun saveToken(token: String) {
        prefs.edit().putString(KEY_TOKEN, token).apply()
    }

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun clearToken() {
        prefs.edit().remove(KEY_TOKEN).remove(KEY_PATIENT_ID).apply()
    }

    fun savePatientId(id: String) {
        prefs.edit().putString(KEY_PATIENT_ID, id).apply()
    }

    fun getPatientId(): String? = prefs.getString(KEY_PATIENT_ID, null)

    fun isLoggedIn(): Boolean = getToken() != null

    companion object {
        private const val PREFS_NAME = "vipmed_auth"
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_PATIENT_ID = "patient_id"
    }
}
