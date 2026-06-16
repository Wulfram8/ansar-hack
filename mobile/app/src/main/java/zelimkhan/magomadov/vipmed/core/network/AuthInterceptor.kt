package zelimkhan.magomadov.vipmed.core.network

import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(private val tokenManager: TokenManager) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()

        // Skip auth header for OTP endpoints
        val path = original.url.encodedPath
        if (path.contains("auth/send-otp") || path.contains("auth/verify-otp")) {
            return chain.proceed(original)
        }

        val token = tokenManager.getToken()
        if (token != null) {
            val request = original.newBuilder()
                .header("Authorization", "Token $token")
                .build()
            return chain.proceed(request)
        }

        return chain.proceed(original)
    }
}
