package com.stgi.segfault.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class InfluxQueryResult {
    private Instant time;
    private String value;
    private String info;
    private String seq;
    private String field;
    private String measurement;
}
