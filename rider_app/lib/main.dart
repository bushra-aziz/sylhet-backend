import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import './services/api_service.dart';
import './screens/login_screen.dart';
import './screens/home_screen.dart';
import './utils/constants.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Status bar transparent banana
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  // Check karo already logged in hai ya nahi
  final apiService = ApiService();
  final isLoggedIn = await apiService.isLoggedIn();

  runApp(SylhetCourierRiderApp(isLoggedIn: isLoggedIn));
}

class SylhetCourierRiderApp extends StatelessWidget {
  final bool isLoggedIn;
  const SylhetCourierRiderApp({super.key, required this.isLoggedIn});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sylhet Courier — Rider',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'sans-serif',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(AppColors.accent),
          background: const Color(AppColors.background),
        ),
        scaffoldBackgroundColor: const Color(AppColors.background),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0,
          systemOverlayStyle: SystemUiOverlayStyle.dark,
        ),
      ),
      // Auto redirect based on login state
      home: isLoggedIn ? const HomeScreen() : LoginScreen(),
    );
  }
}
