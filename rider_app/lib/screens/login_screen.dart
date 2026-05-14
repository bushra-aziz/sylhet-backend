import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';
import './home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  final _passController = TextEditingController();
  final _apiService = ApiService();
  bool _isLoading = false;
  bool _obscurePass = true;

  @override
  void dispose() {
    _phoneController.dispose();
    _passController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    final phone = _phoneController.text.trim();
    final pass = _passController.text.trim();

    if (phone.isEmpty || pass.isEmpty) {
      _showError('Phone number aur password daalna zaroori hai');
      return;
    }

    setState(() => _isLoading = true);

    final result = await _apiService.login(phone, pass);

    setState(() => _isLoading = false);

    if (result['success'] == true) {
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        );
      }
    } else {
      _showError(result['message'] ?? 'Login failed');
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: const Color(AppColors.red),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppColors.background),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 40),

              // ─── Brand ──────────────────────
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: const Color(AppColors.accent),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Center(
                      child: Text('📦', style: TextStyle(fontSize: 22)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Sylhet Courier',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: Color(AppColors.textPrimary),
                          letterSpacing: -0.3,
                        ),
                      ),
                      Container(
                        margin: const EdgeInsets.only(top: 2),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(AppColors.amberLight),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          'Rider App',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Color(AppColors.amber),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 52),

              const Text(
                'Sign In',
                style: TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.w800,
                  color: Color(AppColors.textPrimary),
                  letterSpacing: -0.8,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Apna phone number aur password dalein',
                style: TextStyle(
                  fontSize: 15,
                  color: Color(AppColors.textSecondary),
                ),
              ),

              const SizedBox(height: 36),

              // ─── Phone field ─────────────────
              _label('Phone Number'),
              const SizedBox(height: 8),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                style: const TextStyle(
                  fontSize: 15,
                  color: Color(AppColors.textPrimary),
                  fontWeight: FontWeight.w500,
                ),
                decoration: _inputDecoration(
                  hint: '01XXXXXXXXX',
                  icon: Icons.phone_outlined,
                ),
              ),

              const SizedBox(height: 20),

              // ─── Password field ───────────────
              _label('Password'),
              const SizedBox(height: 8),
              TextField(
                controller: _passController,
                obscureText: _obscurePass,
                style: const TextStyle(
                  fontSize: 15,
                  color: Color(AppColors.textPrimary),
                  fontWeight: FontWeight.w500,
                ),
                decoration: _inputDecoration(
                  hint: '••••••••',
                  icon: Icons.lock_outlined,
                ).copyWith(
                  suffixIcon: GestureDetector(
                    onTap: () => setState(() => _obscurePass = !_obscurePass),
                    child: Icon(
                      _obscurePass
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined,
                      color: const Color(AppColors.textHint),
                      size: 20,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 10),
              const Text(
                'Default password: your phone number',
                style: TextStyle(
                  fontSize: 12,
                  color: Color(AppColors.textHint),
                ),
              ),

              const SizedBox(height: 36),

              // ─── Login button ─────────────────
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _login,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(AppColors.accent),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    disabledBackgroundColor:
                        const Color(AppColors.accent).withOpacity(0.6),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2.5,
                          ),
                        )
                      : const Text(
                          'Sign In',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                ),
              ),

              const SizedBox(height: 24),

              // Demo mode notice
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(AppColors.accentLight),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                      color: const Color(AppColors.accent).withOpacity(0.2)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline,
                        size: 16, color: Color(AppColors.accent)),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Backend offline hone par bhi demo mode mein kaam karega',
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(AppColors.accent),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _label(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: Color(AppColors.textSecondary),
      ),
    );
  }

  InputDecoration _inputDecoration(
      {required String hint, required IconData icon}) {
    return InputDecoration(
      hintText: hint,
      hintStyle:
          const TextStyle(color: Color(AppColors.textHint), fontSize: 14),
      prefixIcon: Icon(icon, size: 18, color: const Color(AppColors.textHint)),
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(AppColors.border)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(AppColors.border)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide:
            const BorderSide(color: Color(AppColors.accent), width: 1.5),
      ),
    );
  }
}
