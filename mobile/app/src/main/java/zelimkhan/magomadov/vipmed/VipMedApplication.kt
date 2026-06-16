package zelimkhan.magomadov.vipmed

import android.app.Application
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin
import zelimkhan.magomadov.vipmed.di.appModule

class VipMedApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidContext(this@VipMedApplication)
            modules(appModule)
        }
    }
}
