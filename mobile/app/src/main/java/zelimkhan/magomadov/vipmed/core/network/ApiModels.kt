package zelimkhan.magomadov.vipmed.core.network

import com.google.gson.annotations.SerializedName

// ── Auth ──────────────────────────────────────────────────────────────

data class SendOtpRequest(val phone: String)

data class SendOtpResponse(val detail: String, val phone: String)

data class VerifyOtpRequest(val phone: String, val code: String)

data class VerifyOtpResponse(
    val token: String,
    @SerializedName("patient_id") val patientId: String,
    @SerializedName("is_profile_complete") val isProfileComplete: Boolean,
)

// ── Profile ──────────────────────────────────────────────────────────

data class ProfileResponse(
    val id: String,
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    val gender: String,
    val phone: String,
)

data class ProfileUpdateRequest(
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    val gender: String = "",
)

// ── Doctors ──────────────────────────────────────────────────────────

data class DoctorResponse(
    val id: String,
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    @SerializedName("middle_name") val middleName: String = "",
    val specialty: String = "",
    val cabinet: String = "",
    @SerializedName("color_hex") val colorHex: String = "",
)

// ── Services ─────────────────────────────────────────────────────────

data class ServiceResponse(
    val id: String,
    val title: String,
    val category: String = "",
    @SerializedName("duration_min") val durationMin: Int = 30,
    @SerializedName("price_kopecks") val priceKopecks: Long = 0,
    @SerializedName("color_hex") val colorHex: String = "",
)

// ── Appointments ─────────────────────────────────────────────────────

data class ServiceBriefResponse(
    val id: String,
    val title: String,
    val category: String = "",
    @SerializedName("duration_min") val durationMin: Int = 30,
    @SerializedName("price_kopecks") val priceKopecks: Long = 0,
)

data class DoctorBriefResponse(
    val id: String,
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    val specialty: String = "",
)

data class AppointmentResponse(
    val id: String,
    val date: String,
    @SerializedName("start_time") val startTime: String,
    @SerializedName("end_time") val endTime: String,
    val status: String,
    val comment: String = "",
    val cabinet: String = "",
    @SerializedName("doctor_detail") val doctorDetail: DoctorBriefResponse? = null,
    @SerializedName("service_detail") val serviceDetail: ServiceBriefResponse? = null,
    @SerializedName("created_at") val createdAt: String = "",
)

data class CreateAppointmentRequest(
    val doctor: String,
    val date: String,
    @SerializedName("start_time") val startTime: String,
    @SerializedName("end_time") val endTime: String,
    val service: String,
    val comment: String = "",
)

// ── Chat ─────────────────────────────────────────────────────────────

data class ChatMessageResponse(
    val id: String,
    @SerializedName("sender_role") val senderRole: String,
    val content: String,
    @SerializedName("created_at") val createdAt: String,
)

data class ChatLastMessage(
    val content: String,
    @SerializedName("sender_role") val senderRole: String,
    @SerializedName("created_at") val createdAt: String,
)

data class ChatRoomResponse(
    val id: String,
    val appointment: String,
    @SerializedName("doctor_name") val doctorName: String,
    @SerializedName("last_message") val lastMessage: ChatLastMessage? = null,
    @SerializedName("created_at") val createdAt: String = "",
)

data class ChatDetailResponse(
    val id: String,
    val appointment: String,
    @SerializedName("doctor_name") val doctorName: String,
    val messages: List<ChatMessageResponse> = emptyList(),
    @SerializedName("created_at") val createdAt: String = "",
)

data class SendMessageRequest(val content: String)

// ── Notifications ────────────────────────────────────────────────────

data class NotificationResponse(
    val id: String,
    val title: String,
    val body: String = "",
    @SerializedName("notification_type") val notificationType: String,
    @SerializedName("is_read") val isRead: Boolean,
    @SerializedName("created_at") val createdAt: String,
)
