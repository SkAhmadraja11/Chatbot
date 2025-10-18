package com.botchat.repository;

import com.botchat.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Message findTopBySenderOrderByTimestampDesc(String sender); }
