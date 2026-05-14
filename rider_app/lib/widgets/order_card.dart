import 'package:flutter/material.dart';
import '../models/orders_model.dart';
import '../utils/constants.dart';

class OrderCard extends StatelessWidget {
  final OrderModel order;
  final VoidCallback? onTap;

  const OrderCard({super.key, required this.order, this.onTap});

  Color get _statusColor {
    switch (order.status) {
      case 'assigned':
        return const Color(AppColors.accent);
      case 'picked_up':
        return Colors.purple;
      case 'out_for_delivery':
        return const Color(AppColors.amber);
      case 'delivered':
        return const Color(AppColors.green);
      case 'failed':
        return const Color(AppColors.red);
      default:
        return const Color(AppColors.textSecondary);
    }
  }

  Color get _statusBg {
    switch (order.status) {
      case 'assigned':
        return const Color(AppColors.accentLight);
      case 'picked_up':
        return Colors.purple.shade50;
      case 'out_for_delivery':
        return const Color(AppColors.amberLight);
      case 'delivered':
        return const Color(AppColors.greenLight);
      case 'failed':
        return const Color(AppColors.redLight);
      default:
        return const Color(AppColors.background);
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(AppColors.border)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ─── Header ───────────────────────
            Container(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: Color(AppColors.border)),
                ),
              ),
              child: Row(
                children: [
                  // Tracking ID
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          order.trackingId,
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: Color(AppColors.accent),
                            letterSpacing: 0.5,
                          ),
                        ),
                        if (order.merchantName != null) ...[
                          const SizedBox(height: 2),
                          Text(
                            'From: ${order.merchantName}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(AppColors.textSecondary),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  // Status badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _statusBg,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(
                            color: _statusColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 5),
                        Text(
                          order.statusDisplay,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: _statusColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // ─── Customer Info ─────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Column(
                children: [
                  _infoRow(
                    Icons.person_outline,
                    order.customerName,
                    bold: true,
                  ),
                  const SizedBox(height: 8),
                  _infoRow(Icons.phone_outlined, order.customerPhone),
                  const SizedBox(height: 8),
                  _infoRow(Icons.location_on_outlined, order.customerAddress),
                  if (order.zoneName != null) ...[
                    const SizedBox(height: 8),
                    _infoRow(Icons.map_outlined, order.zoneName!),
                  ],
                  if (order.deliveryNotes != null &&
                      order.deliveryNotes!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    _infoRow(
                      Icons.note_outlined,
                      order.deliveryNotes!,
                      accent: true,
                    ),
                  ],
                ],
              ),
            ),

            // ─── COD Amount ────────────────────
            Container(
              margin: const EdgeInsets.all(12),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(AppColors.amberLight),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Cash to Collect (COD)',
                    style: TextStyle(
                      fontSize: 13,
                      color: Color(AppColors.amber),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Text(
                    '৳${order.codAmount.toStringAsFixed(0)}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Color(AppColors.amber),
                      letterSpacing: -0.5,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(
    IconData icon,
    String text, {
    bool bold = false,
    bool accent = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 16,
          color: accent
              ? const Color(AppColors.accent)
              : const Color(AppColors.textHint),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              fontSize: 13,
              fontWeight: bold ? FontWeight.w600 : FontWeight.normal,
              color: accent
                  ? const Color(AppColors.accent)
                  : bold
                  ? const Color(AppColors.textPrimary)
                  : const Color(AppColors.textSecondary),
            ),
          ),
        ),
      ],
    );
  }
}
