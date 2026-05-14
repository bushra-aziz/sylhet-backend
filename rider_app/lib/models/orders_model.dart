class OrderModel {
  final String id;
  final String trackingId;
  final String customerName;
  final String customerPhone;
  final String customerAddress;
  final String? zoneName;
  final String? merchantName;
  final String? merchantPhone;
  final double codAmount;
  final double deliveryCharge;
  final String status;
  final String? failureReason;
  final String? deliveryNotes;
  final String? productType;
  final DateTime createdAt;
  final DateTime? pickedUpAt;
  final DateTime? deliveredAt;

  OrderModel({
    required this.id,
    required this.trackingId,
    required this.customerName,
    required this.customerPhone,
    required this.customerAddress,
    this.zoneName,
    this.merchantName,
    this.merchantPhone,
    required this.codAmount,
    required this.deliveryCharge,
    required this.status,
    this.failureReason,
    this.deliveryNotes,
    this.productType,
    required this.createdAt,
    this.pickedUpAt,
    this.deliveredAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'] ?? '',
      trackingId: json['tracking_id'] ?? '',
      customerName: json['customer_name'] ?? '',
      customerPhone: json['customer_phone'] ?? '',
      customerAddress: json['customer_address'] ?? '',
      zoneName: json['zone_name'],
      merchantName: json['merchant_name'],
      merchantPhone: json['merchant_phone'],
      codAmount: double.tryParse(json['cod_amount']?.toString() ?? '0') ?? 0,
      deliveryCharge:
          double.tryParse(json['delivery_charge']?.toString() ?? '0') ?? 0,
      status: json['status'] ?? 'pending',
      failureReason: json['failure_reason'],
      deliveryNotes: json['delivery_notes'],
      productType: json['product_type'],
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      pickedUpAt: json['picked_up_at'] != null
          ? DateTime.tryParse(json['picked_up_at'])
          : null,
      deliveredAt: json['delivered_at'] != null
          ? DateTime.tryParse(json['delivered_at'])
          : null,
    );
  }

  // Status display text (Bangla friendly)
  String get statusDisplay {
    switch (status) {
      case 'assigned':
        return 'Assigned';
      case 'picked_up':
        return 'Picked Up';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'failed':
        return 'Failed';
      case 'returned':
        return 'Returned';
      default:
        return status;
    }
  }

  // Next possible status (for status update button)
  String? get nextStatus {
    switch (status) {
      case 'assigned':
        return 'picked_up';
      case 'picked_up':
        return 'out_for_delivery';
      case 'out_for_delivery':
        return 'delivered';
      default:
        return null;
    }
  }

  String? get nextStatusLabel {
    switch (status) {
      case 'assigned':
        return 'Mark as Picked Up';
      case 'picked_up':
        return 'Mark as Out for Delivery';
      case 'out_for_delivery':
        return 'Mark as Delivered';
      default:
        return null;
    }
  }
}

class RiderModel {
  final String id;
  final String name;
  final String phone;
  final String status;
  final double currentCash;
  final double codLimit;
  final double totalEarnings;
  final String? zoneName;

  RiderModel({
    required this.id,
    required this.name,
    required this.phone,
    required this.status,
    required this.currentCash,
    required this.codLimit,
    required this.totalEarnings,
    this.zoneName,
  });

  factory RiderModel.fromJson(Map<String, dynamic> json) {
    return RiderModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      status: json['status'] ?? 'offline',
      currentCash:
          double.tryParse(json['current_cash']?.toString() ?? '0') ?? 0,
      codLimit:
          double.tryParse(json['cod_limit']?.toString() ?? '10000') ?? 10000,
      totalEarnings:
          double.tryParse(json['total_earnings']?.toString() ?? '0') ?? 0,
      zoneName: json['zone_name'],
    );
  }

  double get codUsagePercent => (currentCash / codLimit) * 100;

  bool get isNearLimit => codUsagePercent >= 80;
  bool get isAtLimit => codUsagePercent >= 100;
  bool get isOnline => status == 'online';
}
