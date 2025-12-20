package es.udc.fi.dc.fd.rest.dtos.user;

import java.util.Collections;
import java.util.List;
import java.util.Map;


public class LeaderboardConversor {

    private LeaderboardConversor(){}
    public static List<LeaderboardDto> toLeaderboardConversor(Map<Long, Integer> leaderboard) {
        if (leaderboard == null) {
            return Collections.emptyList();
        }

        return leaderboard.entrySet()
                .stream()
                .map(entry -> new LeaderboardDto(
                        entry.getKey(),
                        entry.getValue()
                ))
                .toList();
    }

}
