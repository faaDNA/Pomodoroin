package com.pomodoroin.backend;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PomodoroController {

    // id sesi -> menit fokus. In-memory (tanpa database) dan idempotent per id.
    private final ConcurrentHashMap<String, Integer> focusSessions = new ConcurrentHashMap<>();

    record Session(String id, int minutes) {
    }

    record SessionBatch(List<Session> sessions) {
    }

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

    @GetMapping("/api/stats")
    public Map<String, Integer> stats() {
        return Map.of(
                "completed", focusSessions.size(),
                "totalMinutes", focusSessions.values().stream().mapToInt(Integer::intValue).sum());
    }

    @PostMapping("/api/stats/sessions")
    public ResponseEntity<Map<String, Integer>> addSessions(
            @RequestBody(required = false) SessionBatch batch) {
        if (batch == null || batch.sessions() == null || batch.sessions().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        for (Session session : batch.sessions()) {
            if (session == null || session.id() == null || session.id().isBlank()
                    || session.minutes() < 1 || session.minutes() > 180) {
                return ResponseEntity.badRequest().build();
            }
        }
        for (Session session : batch.sessions()) {
            focusSessions.putIfAbsent(session.id().trim(), session.minutes());
        }
        return ResponseEntity.ok(stats());
    }
}
