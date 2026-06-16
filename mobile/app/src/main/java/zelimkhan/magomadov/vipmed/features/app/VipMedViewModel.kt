package zelimkhan.magomadov.vipmed.features.app

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import zelimkhan.magomadov.vipmed.navigation.VipMedRoute

class VipMedViewModel : ViewModel() {
    private val _state = MutableStateFlow(VipMedState())
    val state: StateFlow<VipMedState> = _state.asStateFlow()

    private val _event = Channel<VipMedEvent>()
    val event = _event.receiveAsFlow()

    fun onSplashEvent(event: SplashEvent) {
        when (event) {
            SplashEvent.Started -> openOnboarding()
        }
    }

    fun onOnboardingEvent(event: OnboardingEvent) {
        when (event) {
            OnboardingEvent.ContinueClick -> navigate(
                route = VipMedRoute.Auth.route,
                clearBackStack = true,
            )
        }
    }

    fun onAuthEvent(event: AuthEvent) {
        when (event) {
            is AuthEvent.PhoneChanged -> _state.update {
                it.copy(auth = it.auth.copy(phone = event.phone))
            }

            AuthEvent.ContinueClick -> navigate(route = VipMedRoute.Otp.route)
        }
    }

    fun onOtpEvent(event: OtpEvent) {
        when (event) {
            OtpEvent.BackClick -> navigateBack()
            is OtpEvent.CodeChanged -> _state.update {
                it.copy(otp = it.otp.copy(code = event.code.take(6), hasError = false))
            }

            OtpEvent.ContinueClick -> navigate(
                route = VipMedRoute.ProfileSetup.route,
                clearBackStack = true,
            )
        }
    }

    fun onProfileSetupEvent(event: ProfileSetupEvent) {
        when (event) {
            ProfileSetupEvent.BackClick -> navigateBack()
            ProfileSetupEvent.SaveClick -> navigate(
                route = VipMedRoute.Home.route,
                clearBackStack = true,
            )
        }
    }

    fun onHomeEvent(event: HomeEvent) {
        when (event) {
            HomeEvent.AvatarClick -> navigate(route = VipMedRoute.Profile.route)
            HomeEvent.BookClick -> navigate(route = VipMedRoute.BookingService.route)
            HomeEvent.ChatClick -> navigate(route = VipMedRoute.Chat.route)
            HomeEvent.LabResultsClick -> navigate(route = VipMedRoute.LabResults.route)
            HomeEvent.NotificationsClick -> navigate(route = VipMedRoute.Notifications.route)
        }
    }

    fun onBookingEvent(event: BookingEvent) {
        when (event) {
            BookingEvent.BackClick -> navigateBack()
            BookingEvent.ConfirmClick -> navigate(route = VipMedRoute.BookingSuccess.route)
            BookingEvent.DateNextClick -> navigate(route = VipMedRoute.BookingConfirm.route)
            BookingEvent.DoctorNextClick -> navigate(route = VipMedRoute.BookingDateTime.route)
            BookingEvent.DoneClick -> navigate(
                route = VipMedRoute.Appointments.route,
                clearBackStack = true,
            )

            BookingEvent.ServiceNextClick -> navigate(route = VipMedRoute.BookingDoctor.route)
        }
    }

    fun onAppointmentsEvent(event: AppointmentsEvent) {
        when (event) {
            AppointmentsEvent.DetailsClick -> navigate(route = VipMedRoute.AppointmentDetails.route)
            AppointmentsEvent.FilterClick -> Unit
        }
    }

    fun onAppointmentDetailsEvent(event: AppointmentDetailsEvent) {
        when (event) {
            AppointmentDetailsEvent.BackClick -> navigateBack()
            AppointmentDetailsEvent.ChatClick -> navigate(route = VipMedRoute.Chat.route)
        }
    }

    fun onDoctorsEvent(event: DoctorsEvent) {
        when (event) {
            DoctorsEvent.DoctorClick -> navigate(route = VipMedRoute.DoctorDetails.route)
            DoctorsEvent.FilterClick -> Unit
        }
    }

    fun onDoctorDetailsEvent(event: DoctorDetailsEvent) {
        when (event) {
            DoctorDetailsEvent.BackClick -> navigateBack()
            DoctorDetailsEvent.BookClick -> navigate(route = VipMedRoute.BookingService.route)
        }
    }

    fun onChatEvent(event: ChatEvent) {
        when (event) {
            ChatEvent.BackClick -> navigateBack()
            ChatEvent.CallClick -> Unit
            is ChatEvent.MessageChanged -> _state.update {
                it.copy(chat = it.chat.copy(message = event.message))
            }

            ChatEvent.SendClick -> _state.update {
                it.copy(chat = it.chat.copy(message = ""))
            }
        }
    }

    fun onNotificationsEvent(event: NotificationsEvent) {
        when (event) {
            NotificationsEvent.BackClick -> navigateBack()
            NotificationsEvent.MarkAllReadClick -> Unit
        }
    }

    fun onProfileEvent(event: ProfileEvent) {
        when (event) {
            ProfileEvent.LabResultsClick -> navigate(route = VipMedRoute.LabResults.route)
            ProfileEvent.LogoutClick -> navigate(
                route = VipMedRoute.Auth.route,
                clearBackStack = true,
            )

            ProfileEvent.SettingsClick -> Unit
        }
    }

    fun onLabResultsEvent(event: LabResultsEvent) {
        when (event) {
            LabResultsEvent.BackClick -> navigateBack()
            LabResultsEvent.CloseDetailsClick -> _state.update {
                it.copy(labResults = it.labResults.copy(showDetails = false))
            }

            LabResultsEvent.FilterClick -> Unit
            LabResultsEvent.ResultClick -> _state.update {
                it.copy(labResults = it.labResults.copy(showDetails = true))
            }
        }
    }

    fun onStatesEvent(event: StatesEvent) {
        when (event) {
            StatesEvent.BackClick -> navigateBack()
        }
    }

    private fun openOnboarding() {
        viewModelScope.launch {
            delay(timeMillis = 900)
            navigate(
                route = VipMedRoute.Onboarding.route,
                clearBackStack = true,
            )
        }
    }

    private fun navigate(route: String, clearBackStack: Boolean = false) {
        viewModelScope.launch {
            _event.send(
                VipMedEvent.Navigate(
                    route = route,
                    clearBackStack = clearBackStack,
                )
            )
        }
    }

    private fun navigateBack() {
        viewModelScope.launch {
            _event.send(VipMedEvent.NavigateBack)
        }
    }
}
