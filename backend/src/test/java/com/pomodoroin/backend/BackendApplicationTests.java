package com.pomodoroin.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class BackendApplicationTests {

    @Autowired
    MockMvc mvc;

    @Test
    void endpointsRespond() throws Exception {
        mvc.perform(get("/api/health")).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));

        mvc.perform(get("/api/config")).andExpect(status().isOk())
                .andExpect(jsonPath("$.focusMinutes").value(25));
    }

    // NOTE: state is in-memory and shared by the one application context, so all
    // assertions on /api/stats must live in this single test class/method.

    @Test
    void accumulatesFocusMinutesIdempotently() throws Exception {
        String body = """
                {
                  "sessions": [
                    {"id": "sess-1", "minutes": 25},
                    {"id": "sess-2", "minutes": 25}
                  ]
                }
                """;

        mvc.perform(post("/api/stats/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(2))
                .andExpect(jsonPath("$.totalMinutes").value(50));

        // Repeat "sess-1" with different duration: putIfAbsent ignores duplicate id
        String repeatBody = """
                {
                  "sessions": [
                    {"id": "sess-1", "minutes": 30}
                  ]
                }
                """;

        mvc.perform(post("/api/stats/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(repeatBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(2))
                .andExpect(jsonPath("$.totalMinutes").value(50));
    }

    @Test
    void rejectsInvalidSessions() throws Exception {
        mvc.perform(post("/api/stats/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"sessions\": []}"))
                .andExpect(status().isBadRequest());

        mvc.perform(post("/api/stats/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"sessions\": [{\"id\":\"\", \"minutes\": 25}]}"))
                .andExpect(status().isBadRequest());
    }
}
