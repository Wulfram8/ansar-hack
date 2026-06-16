package zelimkhan.magomadov.vipmed.navigation

sealed class VipMedRoute(val route: String) {
    data object Splash : VipMedRoute(route = "splash")
    data object Onboarding : VipMedRoute(route = "onboarding")
    data object Auth : VipMedRoute(route = "auth")
    data object Otp : VipMedRoute(route = "otp")
    data object ProfileSetup : VipMedRoute(route = "profile_setup")
    data object Home : VipMedRoute(route = "home")
    data object BookingService : VipMedRoute(route = "booking_service")
    data object BookingDoctor : VipMedRoute(route = "booking_doctor")
    data object BookingDateTime : VipMedRoute(route = "booking_date_time")
    data object BookingConfirm : VipMedRoute(route = "booking_confirm")
    data object BookingSuccess : VipMedRoute(route = "booking_success")
    data object Appointments : VipMedRoute(route = "appointments")
    data object AppointmentDetails : VipMedRoute(route = "appointment_details")
    data object Doctors : VipMedRoute(route = "doctors")
    data object DoctorDetails : VipMedRoute(route = "doctor_details")
    data object Chat : VipMedRoute(route = "chat")
    data object Notifications : VipMedRoute(route = "notifications")
    data object Profile : VipMedRoute(route = "profile")
    data object LabResults : VipMedRoute(route = "lab_results")
    data object States : VipMedRoute(route = "states")
}
