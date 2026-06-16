package zelimkhan.magomadov.vipmed.core.network

import retrofit2.http.*

interface ApiService {

    // ── Auth ──────────────────────────────────────────────────────────

    @POST("auth/send-otp/")
    suspend fun sendOtp(@Body request: SendOtpRequest): SendOtpResponse

    @POST("auth/verify-otp/")
    suspend fun verifyOtp(@Body request: VerifyOtpRequest): VerifyOtpResponse

    // ── Profile ──────────────────────────────────────────────────────

    @GET("profile/")
    suspend fun getProfile(): ProfileResponse

    @PUT("profile/")
    suspend fun updateProfile(@Body request: ProfileUpdateRequest): ProfileResponse

    // ── Doctors ──────────────────────────────────────────────────────

    @GET("doctors/")
    suspend fun getDoctors(@Query("search") search: String? = null): List<DoctorResponse>

    @GET("doctors/{id}/")
    suspend fun getDoctorDetail(@Path("id") id: String): DoctorResponse

    // ── Services ─────────────────────────────────────────────────────

    @GET("services/")
    suspend fun getServices(): List<ServiceResponse>

    // ── Appointments ─────────────────────────────────────────────────

    @GET("appointments/")
    suspend fun getAppointments(@Query("period") period: String? = null): List<AppointmentResponse>

    @GET("appointments/{id}/")
    suspend fun getAppointmentDetail(@Path("id") id: String): AppointmentResponse

    @POST("appointments/")
    suspend fun createAppointment(@Body request: CreateAppointmentRequest): AppointmentResponse

    // ── Chat ─────────────────────────────────────────────────────────

    @GET("chats/")
    suspend fun getChatList(): List<ChatRoomResponse>

    @GET("chats/{id}/")
    suspend fun getChatDetail(@Path("id") id: String): ChatDetailResponse

    @GET("chats/appointment/{appointmentId}/")
    suspend fun getChatByAppointment(@Path("appointmentId") appointmentId: String): ChatDetailResponse

    @POST("chats/{chatId}/send/")
    suspend fun sendChatMessage(
        @Path("chatId") chatId: String,
        @Body request: SendMessageRequest,
    ): ChatMessageResponse

    // ── Notifications ────────────────────────────────────────────────

    @GET("notifications/")
    suspend fun getNotifications(): List<NotificationResponse>

    @POST("notifications/mark-read/")
    suspend fun markAllNotificationsRead(): Map<String, String>

    // ── Leads ────────────────────────────────────────────────────────

    @POST("leads/")
    suspend fun createLead(@Body request: CreateLeadRequest): CreateLeadResponse
}
