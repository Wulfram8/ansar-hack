package zelimkhan.magomadov.vipmed.di

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import org.koin.android.ext.koin.androidContext
import org.koin.core.module.dsl.viewModelOf
import org.koin.dsl.module
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import zelimkhan.magomadov.vipmed.BuildConfig
import zelimkhan.magomadov.vipmed.core.network.ApiService
import zelimkhan.magomadov.vipmed.core.network.AuthInterceptor
import zelimkhan.magomadov.vipmed.core.network.TokenManager
import zelimkhan.magomadov.vipmed.features.app.VipMedViewModel
import java.util.concurrent.TimeUnit

val appModule = module {

    single { TokenManager(androidContext()) }

    single { AuthInterceptor(get()) }

    single {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        OkHttpClient.Builder()
            .addInterceptor(get<AuthInterceptor>())
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    single {
        Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(get())
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    single {
        get<Retrofit>().create(ApiService::class.java)
    }

    viewModelOf(::VipMedViewModel)
}
