package com.podomoroin.backend;

import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PodomoroController {

    private final AtomicInteger sessionsCompleted = new AtomicInteger();

    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }

    @GetMapping("/api/config")
    public Map<String, Integer> config() {
        return Map.of(
                "focusMinutes", 25,
                "shortBreakMinutes", 5,
                "longBreakMinutes", 15);
    }

    @PostMapping("/api/stats/complete")
    public Map<String, Integer> statsComplete() {
        return Map.of("completed", sessionsCompleted.incrementAndGet());
    }

    @GetMapping("/api/stats")
    public Map<String, Integer> stats() {
        return Map.of("completed", sessionsCompleted.get());
    }
}