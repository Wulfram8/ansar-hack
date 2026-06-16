package zelimkhan.magomadov.vipmed.di

import org.koin.core.module.dsl.viewModelOf
import org.koin.dsl.module
import zelimkhan.magomadov.vipmed.features.app.VipMedViewModel

val appModule = module {
    viewModelOf(::VipMedViewModel)
}
