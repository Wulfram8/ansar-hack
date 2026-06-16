package zelimkhan.magomadov.vipmed.features.app

import zelimkhan.magomadov.vipmed.core.common.ScreenStatus

data class SplashState(val status: ScreenStatus = ScreenStatus.Loading)
sealed class SplashEvent {
    data object Started : SplashEvent()
}

data class OnboardingState(val status: ScreenStatus = ScreenStatus.Success)
sealed class OnboardingEvent {
    data object ContinueClick : OnboardingEvent()
}

data class AuthState(
    val status: ScreenStatus = ScreenStatus.Success,
    val phone: String = "+7 999 123-45-67",
)
sealed class AuthEvent {
    data class PhoneChanged(val phone: String) : AuthEvent()
    data object ContinueClick : AuthEvent()
}

data class OtpState(
    val status: ScreenStatus = ScreenStatus.Success,
    val code: String = "248619",
    val hasError: Boolean = false,
)
sealed class OtpEvent {
    data class CodeChanged(val code: String) : OtpEvent()
    data object ContinueClick : OtpEvent()
    data object BackClick : OtpEvent()
}

data class ProfileSetupState(
    val status: ScreenStatus = ScreenStatus.Success,
    val fullName: String = "Алина Петрова",
    val birthday: String = "12.04.1992",
)
sealed class ProfileSetupEvent {
    data object SaveClick : ProfileSetupEvent()
    data object BackClick : ProfileSetupEvent()
}

data class HomeState(val status: ScreenStatus = ScreenStatus.Success)
sealed class HomeEvent {
    data object BookClick : HomeEvent()
    data object AvatarClick : HomeEvent()
    data object ChatClick : HomeEvent()
    data object NotificationsClick : HomeEvent()
    data object LabResultsClick : HomeEvent()
}

data class BookingState(
    val status: ScreenStatus = ScreenStatus.Success,
    val selectedService: String = "Кардиолог",
    val selectedDoctor: String = "Иванова Мария С.",
    val selectedDate: String = "15 июня",
    val selectedTime: String = "09:30",
)
sealed class BookingEvent {
    data object BackClick : BookingEvent()
    data object ServiceNextClick : BookingEvent()
    data object DoctorNextClick : BookingEvent()
    data object DateNextClick : BookingEvent()
    data object ConfirmClick : BookingEvent()
    data object DoneClick : BookingEvent()
}

data class AppointmentsState(val status: ScreenStatus = ScreenStatus.Success)
sealed class AppointmentsEvent {
    data object DetailsClick : AppointmentsEvent()
    data object FilterClick : AppointmentsEvent()
}

data class AppointmentDetailsState(val status: ScreenStatus = ScreenStatus.Success)
sealed class AppointmentDetailsEvent {
    data object BackClick : AppointmentDetailsEvent()
    data object ChatClick : AppointmentDetailsEvent()
}

data class DoctorsState(val status: ScreenStatus = ScreenStatus.Success)
sealed class DoctorsEvent {
    data object DoctorClick : DoctorsEvent()
    data object FilterClick : DoctorsEvent()
}

data class DoctorDetailsState(val status: ScreenStatus = ScreenStatus.Success)
sealed class DoctorDetailsEvent {
    data object BackClick : DoctorDetailsEvent()
    data object BookClick : DoctorDetailsEvent()
}

data class ChatState(
    val status: ScreenStatus = ScreenStatus.Success,
    val message: String = "",
)
sealed class ChatEvent {
    data object BackClick : ChatEvent()
    data object CallClick : ChatEvent()
    data class MessageChanged(val message: String) : ChatEvent()
    data object SendClick : ChatEvent()
}

data class NotificationsState(val status: ScreenStatus = ScreenStatus.Success)
sealed class NotificationsEvent {
    data object BackClick : NotificationsEvent()
    data object MarkAllReadClick : NotificationsEvent()
}

data class ProfileState(val status: ScreenStatus = ScreenStatus.Success)
sealed class ProfileEvent {
    data object SettingsClick : ProfileEvent()
    data object LabResultsClick : ProfileEvent()
    data object LogoutClick : ProfileEvent()
}

data class LabResultsState(
    val status: ScreenStatus = ScreenStatus.Success,
    val showDetails: Boolean = true,
)
sealed class LabResultsEvent {
    data object BackClick : LabResultsEvent()
    data object FilterClick : LabResultsEvent()
    data object ResultClick : LabResultsEvent()
    data object CloseDetailsClick : LabResultsEvent()
}

data class StatesState(val status: ScreenStatus = ScreenStatus.Success)
sealed class StatesEvent {
    data object BackClick : StatesEvent()
}

data class VipMedState(
    val splash: SplashState = SplashState(),
    val onboarding: OnboardingState = OnboardingState(),
    val auth: AuthState = AuthState(),
    val otp: OtpState = OtpState(),
    val profileSetup: ProfileSetupState = ProfileSetupState(),
    val home: HomeState = HomeState(),
    val booking: BookingState = BookingState(),
    val appointments: AppointmentsState = AppointmentsState(),
    val appointmentDetails: AppointmentDetailsState = AppointmentDetailsState(),
    val doctors: DoctorsState = DoctorsState(),
    val doctorDetails: DoctorDetailsState = DoctorDetailsState(),
    val chat: ChatState = ChatState(),
    val notifications: NotificationsState = NotificationsState(),
    val profile: ProfileState = ProfileState(),
    val labResults: LabResultsState = LabResultsState(),
    val states: StatesState = StatesState(),
)

sealed class VipMedEvent {
    data class Navigate(val route: String, val clearBackStack: Boolean = false) : VipMedEvent()
    data object NavigateBack : VipMedEvent()
    data class ShowMessage(val message: String) : VipMedEvent()
}
