package com.botchat.service;

import com.botchat.model.User;
import com.botchat.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder(); // For hashing passwords
    }

    // Register user
    public String register(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return "Username already exists!";
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return "Success! User registered.";
    }

    // Login user
    public String login(String username, String password) {
        Optional<User> optUser = userRepository.findByUsername(username);
        if (optUser.isEmpty()) {
            return "Invalid username!";
        }

        User user = optUser.get();
        if (passwordEncoder.matches(password, user.getPassword())) {
            return "Success! User logged in.";
        } else {
            return "Incorrect password!";
        }
    }
}
