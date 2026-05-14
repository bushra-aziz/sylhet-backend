class AppConstants {
  // Apna backend ka IP yahan daalo
  // Emulator ke liye: 10.0.2.2 (localhost ka alias
  // Real phone ke liye: apne computer ka IP (192.168.x.x)
  static const String baseUrl =
      'http://192.168.10.2:5000/api'; // Order statuses
  static const String statusPending = 'pending';
  static const String statusAssigned = 'assigned';
  static const String statusPickedUp = 'picked_up';
  static const String statusOutForDelivery = 'out_for_delivery';
  static const String statusDelivered = 'delivered';
  static const String statusFailed = 'failed';
  static const String statusReturned = 'returned';

  // SharedPreferences keys
  static const String tokenKey = 'rider_token';
  static const String riderDataKey = 'rider_data';

  // Failure reasons (rider ke liye)
  static const List<String> failureReasons = [
    'Customer phone off',
    'Customer refused delivery',
    'Wrong address',
    'Customer not at home',
    'Area not accessible',
    'Customer asked to reschedule',
  ];
}

class AppColors {
  // Main brand color (dark navy)
  static const int primary = 0xFF1E293B;
  static const int accent = 0xFF3B82F6;
  static const int accentLight = 0xFFEFF6FF;

  static const int green = 0xFF16A34A;
  static const int greenLight = 0xFFDCFCE7;
  static const int amber = 0xFFD97706;
  static const int amberLight = 0xFFFEF3C7;
  static const int red = 0xFFDC2626;
  static const int redLight = 0xFFFEE2E2;

  static const int surface = 0xFFFFFFFF;
  static const int background = 0xFFF8F7F4;
  static const int border = 0xFFE2E8F0;
  static const int textPrimary = 0xFF0F172A;
  static const int textSecondary = 0xFF64748B;
  static const int textHint = 0xFF94A3B8;
}
