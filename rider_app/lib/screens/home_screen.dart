import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/orders_model.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';
import '../widgets/order_card.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _apiService = ApiService();
  int _currentTab = 0;
  List<OrderModel> _orders = [];
  RiderModel? _rider;
  bool _loading = true;
  bool _togglingStatus = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    final orders = await _apiService.getMyOrders();
    final rider = await _apiService.getProfile();
    setState(() {
      _orders = orders;
      _rider = rider ?? _demoRider();
      _loading = false;
    });
  }

  RiderModel _demoRider() => RiderModel(
        id: 'demo',
        name: 'Kamal Uddin',
        phone: '01712345678',
        status: 'online',
        currentCash: 3200,
        codLimit: 10000,
        totalEarnings: 34500,
        zoneName: 'Zindabazar',
      );

  // Active orders = assigned, picked_up, out_for_delivery
  List<OrderModel> get _activeOrders => _orders
      .where((o) =>
          ['assigned', 'picked_up', 'out_for_delivery'].contains(o.status))
      .toList();

  // Completed = delivered, failed, returned
  List<OrderModel> get _completedOrders => _orders
      .where((o) => ['delivered', 'failed', 'returned'].contains(o.status))
      .toList();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppColors.background),
      appBar: _buildAppBar(),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : [
              _buildActiveOrdersTab(),
              _buildAllOrdersTab(),
              _buildProfileTab(),
            ][_currentTab],
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  // ─── App Bar ───────────────────────────────
  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      titleSpacing: 20,
      title: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: const Color(AppColors.accent),
              borderRadius: BorderRadius.circular(8),
            ),
            child:
                const Center(child: Text('📦', style: TextStyle(fontSize: 16))),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _rider?.name ?? 'Loading...',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: Color(AppColors.textPrimary),
                ),
              ),
              Text(
                _rider?.zoneName ?? 'Rider',
                style: const TextStyle(
                    fontSize: 11, color: Color(AppColors.textSecondary)),
              ),
            ],
          ),
        ],
      ),
      actions: [
        // Online/Offline toggle
        if (_rider != null)
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: GestureDetector(
              onTap: _toggleOnlineStatus,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: _rider!.isOnline
                      ? const Color(AppColors.greenLight)
                      : const Color(AppColors.redLight),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: _rider!.isOnline
                        ? const Color(AppColors.green).withOpacity(0.3)
                        : const Color(AppColors.red).withOpacity(0.3),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: BoxDecoration(
                        color: _rider!.isOnline
                            ? const Color(AppColors.green)
                            : const Color(AppColors.red),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      _togglingStatus
                          ? '...'
                          : _rider!.isOnline
                              ? 'Online'
                              : 'Offline',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: _rider!.isOnline
                            ? const Color(AppColors.green)
                            : const Color(AppColors.red),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(height: 1, color: const Color(AppColors.border)),
      ),
    );
  }

  // ─── Bottom Navigation ─────────────────────
  Widget _buildBottomNav() {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(AppColors.border))),
      ),
      child: BottomNavigationBar(
        currentIndex: _currentTab,
        onTap: (i) => setState(() => _currentTab = i),
        backgroundColor: Colors.white,
        elevation: 0,
        selectedItemColor: const Color(AppColors.accent),
        unselectedItemColor: const Color(AppColors.textHint),
        selectedLabelStyle:
            const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
        unselectedLabelStyle: const TextStyle(fontSize: 11),
        items: [
          BottomNavigationBarItem(
            icon: Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(Icons.local_shipping_outlined),
                if (_activeOrders.isNotEmpty)
                  Positioned(
                    right: -6,
                    top: -4,
                    child: Container(
                      width: 16,
                      height: 16,
                      decoration: const BoxDecoration(
                        color: Color(AppColors.red),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          '${_activeOrders.length}',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            label: 'Active',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.history_outlined),
            label: 'All Orders',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  // ─── Tab 1: Active Orders ──────────────────
  Widget _buildActiveOrdersTab() {
    return RefreshIndicator(
      onRefresh: _loadData,
      color: const Color(AppColors.accent),
      child: _activeOrders.isEmpty
          ? _emptyState('No active orders', '', Icons.inbox_outlined)
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _activeOrders.length,
              itemBuilder: (ctx, i) {
                final order = _activeOrders[i];
                return OrderCard(
                  order: order,
                  onTap: () => _openOrderDetail(order),
                );
              },
            ),
    );
  }

  // ─── Tab 2: All Orders ─────────────────────
  Widget _buildAllOrdersTab() {
    return RefreshIndicator(
      onRefresh: _loadData,
      color: const Color(AppColors.accent),
      child: _orders.isEmpty
          ? _emptyState('No orders yet', '', Icons.inbox_outlined)
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _orders.length,
              itemBuilder: (ctx, i) => OrderCard(order: _orders[i]),
            ),
    );
  }

  // ─── Tab 3: Profile ────────────────────────
  Widget _buildProfileTab() {
    if (_rider == null) return const Center(child: CircularProgressIndicator());
    final codPct = _rider!.codUsagePercent.clamp(0, 100);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Profile card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(AppColors.border)),
            ),
            child: Column(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: const Color(AppColors.accentLight),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Center(
                    child: Text(
                      _rider!.name.substring(0, 1).toUpperCase(),
                      style: const TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        color: Color(AppColors.accent),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  _rider!.name,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: Color(AppColors.textPrimary),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _rider!.phone,
                  style: const TextStyle(
                      fontSize: 13, color: Color(AppColors.textSecondary)),
                ),
                if (_rider!.zoneName != null) ...[
                  const SizedBox(height: 4),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(AppColors.accentLight),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'Zone: ${_rider!.zoneName}',
                      style: const TextStyle(
                          fontSize: 12,
                          color: Color(AppColors.accent),
                          fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 14),

          // Earnings stats
          Row(
            children: [
              Expanded(
                child: _statCard(
                    'Total Earnings',
                    '৳${_rider!.totalEarnings.toStringAsFixed(0)}',
                    AppColors.green,
                    AppColors.greenLight),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _statCard('Today Orders', '${_activeOrders.length}',
                    AppColors.accent, AppColors.accentLight),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // COD Cash in hand
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: _rider!.isNearLimit
                  ? const Color(AppColors.amberLight)
                  : Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: _rider!.isNearLimit
                    ? const Color(AppColors.amber).withOpacity(0.4)
                    : const Color(AppColors.border),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Cash in Hand (COD)',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: _rider!.isNearLimit
                            ? const Color(AppColors.amber)
                            : const Color(AppColors.textSecondary),
                      ),
                    ),
                    if (_rider!.isNearLimit)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(AppColors.amberLight),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                              color: const Color(AppColors.amber)
                                  .withOpacity(0.4)),
                        ),
                        child: const Text(
                          '⚠️ Near Limit',
                          style: TextStyle(
                              fontSize: 11,
                              color: Color(AppColors.amber),
                              fontWeight: FontWeight.w700),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      '৳${_rider!.currentCash.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: Color(AppColors.amber),
                        letterSpacing: -0.5,
                      ),
                    ),
                    Text(
                      ' / ৳${_rider!.codLimit.toStringAsFixed(0)}',
                      style: const TextStyle(
                          fontSize: 14, color: Color(AppColors.textHint)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: LinearProgressIndicator(
                    value: codPct / 100,
                    backgroundColor: const Color(AppColors.border),
                    valueColor: AlwaysStoppedAnimation<Color>(
                      codPct > 80
                          ? const Color(AppColors.red)
                          : codPct > 60
                              ? const Color(AppColors.amber)
                              : const Color(AppColors.green),
                    ),
                    minHeight: 8,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  '${codPct.toStringAsFixed(0)}% of limit used',
                  style: const TextStyle(
                      fontSize: 12, color: Color(AppColors.textHint)),
                ),
                if (_rider!.isAtLimit) ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(AppColors.redLight),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.error_outline,
                            color: Color(AppColors.red), size: 16),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Limit full! Office mein cash jama karein',
                            style: TextStyle(
                                fontSize: 12,
                                color: Color(AppColors.red),
                                fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Logout
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () async {
                await _apiService.logout();
                if (mounted) {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (_) => LoginScreen()),
                  );
                }
              },
              icon: const Icon(Icons.logout,
                  size: 18, color: Color(AppColors.red)),
              label: const Text('Logout',
                  style: TextStyle(color: Color(AppColors.red))),
              style: OutlinedButton.styleFrom(
                side: BorderSide(
                    color: const Color(AppColors.red).withOpacity(0.4)),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Order Detail Bottom Sheet ─────────────
  void _openOrderDetail(OrderModel order) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _OrderDetailSheet(
        order: order,
        onStatusUpdate: (status, {cash, reason}) async {
          Navigator.pop(context);
          final result = await _apiService.updateOrderStatus(
            order.id,
            status,
            collectedCash: cash,
            failureReason: reason,
          );
          if (result['success'] == true) {
            _showSuccess('Status updated!');
            _loadData();
          } else {
            _showError(result['message'] ?? 'Update failed');
          }
        },
      ),
    );
  }

  Widget _statCard(String label, String value, int color, int bgColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Color(bgColor),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: Color(color))),
          const SizedBox(height: 6),
          Text(value,
              style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: Color(color),
                  letterSpacing: -0.5)),
        ],
      ),
    );
  }

  Widget _emptyState(String title, String sub, IconData icon) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 52, color: const Color(AppColors.textHint)),
          const SizedBox(height: 14),
          Text(title,
              style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Color(AppColors.textPrimary))),
          const SizedBox(height: 6),
          Text(sub,
              style: const TextStyle(
                  fontSize: 13, color: Color(AppColors.textSecondary))),
          const SizedBox(height: 20),
          TextButton.icon(
            onPressed: _loadData,
            icon: const Icon(Icons.refresh),
            label: const Text('Refresh'),
          ),
        ],
      ),
    );
  }

  Future<void> _toggleOnlineStatus() async {
    setState(() => _togglingStatus = true);
    final success = await _apiService.toggleOnlineStatus();
    if (success) {
      setState(() {
        final newStatus = _rider!.isOnline ? 'offline' : 'online';
        _rider = RiderModel(
          id: _rider!.id,
          name: _rider!.name,
          phone: _rider!.phone,
          status: newStatus,
          currentCash: _rider!.currentCash,
          codLimit: _rider!.codLimit,
          totalEarnings: _rider!.totalEarnings,
          zoneName: _rider!.zoneName,
        );
      });
    } else {
      // Demo toggle
      setState(() {
        final newStatus = _rider!.isOnline ? 'offline' : 'online';
        _rider = RiderModel(
          id: _rider!.id,
          name: _rider!.name,
          phone: _rider!.phone,
          status: newStatus,
          currentCash: _rider!.currentCash,
          codLimit: _rider!.codLimit,
          totalEarnings: _rider!.totalEarnings,
          zoneName: _rider!.zoneName,
        );
      });
    }
    setState(() => _togglingStatus = false);
  }

  void _showSuccess(String msg) => ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(msg),
            backgroundColor: const Color(AppColors.green),
            behavior: SnackBarBehavior.floating,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
      );
  void _showError(String msg) => ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(msg),
            backgroundColor: const Color(AppColors.red),
            behavior: SnackBarBehavior.floating,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
      );
}

// ─── Order Detail Bottom Sheet ─────────────────
class _OrderDetailSheet extends StatefulWidget {
  final OrderModel order;
  final Function(String status, {double? cash, String? reason}) onStatusUpdate;

  const _OrderDetailSheet({required this.order, required this.onStatusUpdate});

  @override
  State<_OrderDetailSheet> createState() => _OrderDetailSheetState();
}

class _OrderDetailSheetState extends State<_OrderDetailSheet> {
  final _cashController = TextEditingController();
  String? _selectedReason;
  bool _showFailOptions = false;

  @override
  void initState() {
    super.initState();
    _cashController.text = widget.order.codAmount.toStringAsFixed(0);
  }

  @override
  Widget build(BuildContext context) {
    final order = widget.order;
    return Container(
      margin: const EdgeInsets.only(top: 60),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            margin: const EdgeInsets.symmetric(vertical: 12),
            width: 36,
            height: 4,
            decoration: BoxDecoration(
                color: const Color(AppColors.border),
                borderRadius: BorderRadius.circular(2)),
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    children: [
                      Expanded(
                        child: Text(order.trackingId,
                            style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: Color(AppColors.accent),
                                letterSpacing: 0.5)),
                      ),
                      // Call button
                      _actionButton(
                        icon: Icons.call,
                        label: 'Call',
                        color: AppColors.green,
                        bgColor: AppColors.greenLight,
                        onTap: () =>
                            launchUrl(Uri.parse('tel:${order.customerPhone}')),
                      ),
                      const SizedBox(width: 8),
                      // Maps button
                      _actionButton(
                        icon: Icons.map_outlined,
                        label: 'Maps',
                        color: AppColors.accent,
                        bgColor: AppColors.accentLight,
                        onTap: () {
                          final query =
                              Uri.encodeComponent(order.customerAddress);
                          launchUrl(
                              Uri.parse('https://maps.google.com/?q=$query'));
                        },
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),
                  OrderCard(order: order),

                  // Status update section
                  if (order.nextStatus != null && !_showFailOptions) ...[
                    const SizedBox(height: 8),

                    // Cash input (only for delivery)
                    if (order.status == 'out_for_delivery') ...[
                      const Text('Collected Cash Amount (৳)',
                          style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Color(AppColors.textSecondary))),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _cashController,
                        keyboardType: TextInputType.number,
                        style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: Color(AppColors.amber)),
                        decoration: InputDecoration(
                          prefixText: '৳ ',
                          prefixStyle: const TextStyle(
                              fontSize: 16, color: Color(AppColors.amber)),
                          filled: true,
                          fillColor: const Color(AppColors.amberLight),
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide.none),
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 12),
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],

                    // Main action button
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: () {
                          final cash = order.status == 'out_for_delivery'
                              ? double.tryParse(_cashController.text) ??
                                  order.codAmount
                              : null;
                          widget.onStatusUpdate(order.nextStatus!, cash: cash);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(AppColors.accent),
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        child: Text(order.nextStatusLabel!,
                            style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: Colors.white)),
                      ),
                    ),

                    // Fail delivery option (only when out for delivery)
                    if (order.status == 'out_for_delivery') ...[
                      const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        height: 46,
                        child: OutlinedButton(
                          onPressed: () =>
                              setState(() => _showFailOptions = true),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(
                                color: const Color(AppColors.red)
                                    .withOpacity(0.4)),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                          ),
                          child: const Text('Mark as Failed / Return',
                              style: TextStyle(
                                  color: Color(AppColors.red),
                                  fontWeight: FontWeight.w600)),
                        ),
                      ),
                    ],
                  ],

                  // Failure reason selection
                  if (_showFailOptions) ...[
                    const SizedBox(height: 8),
                    const Text('Select Failure Reason:',
                        style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Color(AppColors.textSecondary))),
                    const SizedBox(height: 10),
                    ...AppConstants.failureReasons.map((reason) =>
                        GestureDetector(
                          onTap: () => setState(() => _selectedReason = reason),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 14, vertical: 12),
                            decoration: BoxDecoration(
                              color: _selectedReason == reason
                                  ? const Color(AppColors.redLight)
                                  : const Color(AppColors.background),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: _selectedReason == reason
                                    ? const Color(AppColors.red)
                                        .withOpacity(0.4)
                                    : const Color(AppColors.border),
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  _selectedReason == reason
                                      ? Icons.radio_button_checked
                                      : Icons.radio_button_unchecked,
                                  size: 18,
                                  color: _selectedReason == reason
                                      ? const Color(AppColors.red)
                                      : const Color(AppColors.textHint),
                                ),
                                const SizedBox(width: 10),
                                Text(reason,
                                    style: const TextStyle(
                                        fontSize: 13,
                                        color: Color(AppColors.textPrimary))),
                              ],
                            ),
                          ),
                        )),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: _selectedReason == null
                            ? null
                            : () {
                                widget.onStatusUpdate('failed',
                                    reason: _selectedReason);
                              },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(AppColors.red),
                          disabledBackgroundColor:
                              const Color(AppColors.red).withOpacity(0.4),
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Confirm Failed Delivery',
                            style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: Colors.white)),
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: () => setState(() => _showFailOptions = false),
                      child: const Text('Back'),
                    ),
                  ],

                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionButton(
      {required IconData icon,
      required String label,
      required int color,
      required int bgColor,
      required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: Color(bgColor),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            Icon(icon, size: 16, color: Color(color)),
            const SizedBox(width: 5),
            Text(label,
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: Color(color))),
          ],
        ),
      ),
    );
  }
}
