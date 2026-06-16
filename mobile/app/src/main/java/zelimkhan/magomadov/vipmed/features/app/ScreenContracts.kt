package zelimkhan.magomadov.vipmed.features.app

import zelimkhan.magomadov.vipmed.core.common.ScreenStatus
import zelimkhan.magomadov.vipmed.core.network.*

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
    val phone: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
)
sealed class AuthEvent {
    data class PhoneChanged(val phone: String) : AuthEvent()
    data object ContinueClick : AuthEvent()
}

data class OtpState(
    val status: ScreenStatus = ScreenStatus.Success,
    val code: String = "",
    val hasError: Boolean = false,
    val errorMessage: String? = null,
    val isLoading: Boolean = false,
)
sealed class OtpEvent {
    data class CodeChanged(val code: String) : OtpEvent()
    data object ContinueClick : OtpEvent()
    data object BackClick : OtpEvent()
}

data class ProfileSetupState(
    val status: ScreenStatus = ScreenStatus.Success,
    val firstName: String = "",
    val lastName: String = "",
    val birthDate: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
)
sealed class ProfileSetupEvent {
    data class FirstNameChanged(val name: String) : ProfileSetupEvent()
    data class LastNameChanged(val name: String) : ProfileSetupEvent()
    data class BirthDateChanged(val date: String) : ProfileSetupEvent()
    data object SaveClick : ProfileSetupEvent()
    data object BackClick : ProfileSetupEvent()
}

data class LeadRequestState(
    val status: ScreenStatus = ScreenStatus.Success,
    val name: String = "",
    val phone: String = "",
    val comment: String = "",
    val isLoading: Boolean = false,
    val isSubmitted: Boolean = false,
    val error: String? = null,
)
sealed class LeadRequestEvent {
    data class NameChanged(val name: String) : LeadRequestEvent()
    data class PhoneChanged(val phone: String) : LeadRequestEvent()
    data class CommentChanged(val comment: String) : LeadRequestEvent()
    data object SubmitClick : LeadRequestEvent()
    data object BackClick : LeadRequestEvent()
    data object DoneClick : LeadRequestEvent()
}

data class HomeState(
    val status: ScreenStatus = ScreenStatus.Loading,
    val profileName: String = "",
    val profileInitials: String = "",
    val nearestAppointment: AppointmentResponse? = null,
)
sealed class HomeEvent {
    data object BookClick : HomeEvent()
    data object RequestCallClick : HomeEvent()
    data object AvatarClick : HomeEvent()
    data object ChatClick : HomeEvent()
    data object NotificationsClick : HomeEvent()
    data object LabResultsClick : HomeEvent()
    data object ScreenOpened : HomeEvent()
}

data class BookingState(
    val status: ScreenStatus = ScreenStatus.Loading,
    val services: List<ServiceResponse> = emptyList(),
    val doctors: List<DoctorResponse> = emptyList(),
    val selectedService: ServiceResponse? = null,
    val selectedDoctor: DoctorResponse? = null,
    val selectedDate: String = "",
    val selectedTime: String = "",
    val isLoading: Boolean = false,
)
sealed class BookingEvent {
    data object BackClick : BookingEvent()
    data class ServiceSelected(val service: ServiceResponse) : BookingEvent()
    data class DoctorSelected(val doctor: DoctorResponse) : BookingEvent()
    data class DateSelected(val date: String) : BookingEvent()
    data class TimeSelected(val time: String) : BookingEvent()
    data object ServiceNextClick : BookingEvent()
    data object DoctorNextClick : BookingEvent()
    data object DateNextClick : BookingEvent()
    data object ConfirmClick : BookingEvent()
    data object DoneClick : BookingEvent()
    data object LoadServices : BookingEvent()
    data object LoadDoctors : BookingEvent()
}

data class AppointmentsState(
    val status: ScreenStatus = ScreenStatus.Loading,
    val appointments: List<AppointmentResponse> = emptyList(),
    val selectedPeriod: String = "future",
)
sealed class AppointmentsEvent {
    data class DetailsClick(val appointmentId: String) : AppointmentsEvent()
    data object FilterClick : AppointmentsEvent()
    data object ScreenOpened : AppointmentsEvent()
    data class PeriodChanged(val period: String) : AppointmentsEvent()
}

data class AppointmentDetailsState(
    val status: ScreenStatus = ScreenStatus.Loading,
    val appointment: AppointmentResponse? = null,
)
sealed class AppointmentDetailsEvent {
    data object BackClick : AppointmentDetailsEvent()
    data object ChatClick : AppointmentDetailsEvent()
}

data class DoctorsState(
    val status: ScreenStatus = ScreenStatus.Loading,
    val doctors: List<DoctorResponse> = emptyList(),
    val searchQuery: String = "",
)
sealed class DoctorsEvent {
    data class DoctorClick(val doctorId: String) : DoctorsEvent()
    data object FilterClick : DoctorsEvent()
    data object ScreenOpened : DoctorsEvent()
    data class SearchChanged(val query: String) : DoctorsEvent()
}

data class DoctorDetailsState(
    val status: ScreenStatus = ScreenStatus.Loading,
    val doctor: DoctorResponse? = null,
)
sealed class DoctorDetailsEvent {
    data object BackClick : DoctorDetailsEvent()
    data object BookClick : DoctorDetailsEvent()
}

data class ChatState(
    val status: ScreenStatus = ScreenStatus.Loading,
    val message: String = "",
    val chatId: String? = null,
    val doctorName: String = "",
    val messages: List<ChatMessageResponse> = emptyList(),
    val appointmentId: String? = null,
)
sealed class ChatEvent {
    data object BackClick : ChatEvent()
    data object CallClick : ChatEvent()
    data class MessageChanged(val message: String) : ChatEvent()
    data object SendClick : ChatEvent()
}

data class NotificationsState(
    val status: ScreenStatus = ScreenStatus.Loading,
    val notifications: List<NotificationResponse> = emptyList(),
)
sealed class NotificationsEvent {
    data object BackClick : NotificationsEvent()
    data object MarkAllReadClick : NotificationsEvent()
    data object ScreenOpened : NotificationsEvent()
}

data class ProfileState(
    val status: ScreenStatus = ScreenStatus.Loading,
    val profile: ProfileResponse? = null,
)
sealed class ProfileEvent {
    data object SettingsClick : ProfileEvent()
    data object LabResultsClick : ProfileEvent()
    data object LogoutClick : ProfileEvent()
    data object ScreenOpened : ProfileEvent()
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
    val leadRequest: LeadRequestState = LeadRequestState(),
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
