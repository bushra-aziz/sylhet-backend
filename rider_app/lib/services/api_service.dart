import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';
import '../models/orders_model.dart';

class ApiService {
  // Token SharedPreferences se lo
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(AppConstants.tokenKey);
  }

  // Common headers
  Future<Map<String, String>> _headers() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // ─── AUTH ──────────────────────────────────

  Future<Map<String, dynamic>> login(String phone, String password) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/auth/rider/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'phone': phone, 'password': password}),
      );
      final data = jsonDecode(response.body);

      if (data['success'] == true) {
        // Token save karo
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(AppConstants.tokenKey, data['token']);
        await prefs.setString(
            AppConstants.riderDataKey, jsonEncode(data['user']));
      }
      return data;
    } catch (e) {
      return {'success': false, 'message': 'Connection failed. Check backend.'};
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.tokenKey);
    await prefs.remove(AppConstants.riderDataKey);
  }

  Future<bool> isLoggedIn() async {
    final token = await _getToken();
    return token != null && token.isNotEmpty;
  }

  // ─── RIDER PROFILE ─────────────────────────

  Future<RiderModel?> getProfile() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/riders/me/profile'),
        headers: await _headers(),
      );
      final data = jsonDecode(response.body);
      if (data['success'] == true) {
        return RiderModel.fromJson(data['rider']);
      }
    } catch (e) {
      // demo data
    }
    return null;
  }

  Future<bool> toggleOnlineStatus() async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/riders/me/toggle-status'),
        headers: await _headers(),
      );
      final data = jsonDecode(response.body);
      return data['success'] == true;
    } catch (e) {
      return false;
    }
  }

  // ─── ORDERS ────────────────────────────────

  Future<List<OrderModel>> getMyOrders() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/orders/rider/my'),
        headers: await _headers(),
      );
      final data = jsonDecode(response.body);
      if (data['success'] == true) {
        return (data['orders'] as List)
            .map((o) => OrderModel.fromJson(o))
            .toList();
      }
    } catch (e) {
      // Return demo orders if backend not available
      return _demoOrders();
    }
    return [];
  }

  Future<Map<String, dynamic>> updateOrderStatus(
    String orderId,
    String status, {
    double? collectedCash,
    String? failureReason,
  }) async {
    try {
      final body = <String, dynamic>{'status': status};
      if (collectedCash != null) body['collected_cash'] = collectedCash;
      if (failureReason != null) body['failure_reason'] = failureReason;

      final response = await http.put(
        Uri.parse('${AppConstants.baseUrl}/orders/$orderId/status'),
        headers: await _headers(),
        body: jsonEncode(body),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Connection error'};
    }
  }

  // Demo orders — backend chal na raha ho tab bhi app kaam kare
  List<OrderModel> _demoOrders() {
    return [
      OrderModel(
        id: 'demo1',
        trackingId: 'SYL2412001',
        customerName: 'Rashida Begum',
        customerPhone: '01711111111',
        customerAddress: '45 Zindabazar Road, Near Sylhet Court',
        zoneName: 'Zindabazar',
        merchantName: 'Sylhet Fashion House',
        merchantPhone: '01812000001',
        codAmount: 850,
        deliveryCharge: 60,
        status: 'assigned',
        productType: 'Clothing',
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      ),
      OrderModel(
        id: 'demo2',
        trackingId: 'SYL2412002',
        customerName: 'Kamal Hossain',
        customerPhone: '01811111111',
        customerAddress: '12 Upashahar Housing, Block C',
        zoneName: 'Upashahar',
        merchantName: 'Bondor Bakery',
        merchantPhone: '01912000002',
        codAmount: 1200,
        deliveryCharge: 70,
        status: 'picked_up',
        deliveryNotes: 'Fragile item, handle with care',
        productType: 'Food',
        createdAt: DateTime.now().subtract(const Duration(hours: 1)),
      ),
    ];
  }
}
