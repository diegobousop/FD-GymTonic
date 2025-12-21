package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import org.junit.Test;

import es.udc.fi.dc.fd.model.entities.Avatar;
import es.udc.fi.dc.fd.model.entities.Routine;
import es.udc.fi.dc.fd.model.entities.Training;
import es.udc.fi.dc.fd.model.entities.Users;
import es.udc.fi.dc.fd.rest.dtos.user.ExercisesStatsDto;
import es.udc.fi.dc.fd.rest.dtos.user.MuscularGroupsStatsDto;
import es.udc.fi.dc.fd.rest.dtos.user.PeriodExerciseStatsDto;
import es.udc.fi.dc.fd.rest.dtos.user.PeriodMuscularGroupStatsDto;
import es.udc.fi.dc.fd.rest.dtos.user.UserStatsDto;
import es.udc.fi.dc.fd.rest.dtos.user.UserStatsParamsDto;


public class DtosTest {
            @Test
            public void testExerciseRoutineDto_GettersSetters() {
                ExerciseRoutineDto dto = new ExerciseRoutineDto(1L, "name", "desc", null, 5, null, null, new ArrayList<>(), "imgB64", 10, 2);
                dto.setId(2L);
                dto.setName("newName");
                dto.setDescripcion("newDesc");
                dto.setGrupoMuscular(null);
                dto.setNumeroSeries(6);
                dto.setDifficulty(null);
                dto.setEquipment(null);
                List<SerieSummaryDto> series = new ArrayList<>();
                dto.setSeries(series);
                dto.setExerciseImageBase64("imgB642");
                dto.setOrderInRoutine(3);
                dto.setRestTime(20);
                assertEquals(Long.valueOf(2L), dto.getId());
                assertEquals("newName", dto.getName());
                assertEquals("newDesc", dto.getDescripcion());
                assertNull(dto.getGrupoMuscular());
                assertEquals(6, dto.getNumeroSeries());
                assertNull(dto.getDifficulty());
                assertNull(dto.getEquipment());
                assertEquals(series, dto.getSeries());
                assertEquals("imgB642", dto.getExerciseImageBase64());
                assertEquals(3, dto.getOrderInRoutine());
                assertEquals(20, dto.getRestTime());
            }

            @Test
            public void testResumeUserDto_GettersSetters() {
                ResumeUserDto dto = new ResumeUserDto();
                dto.setId(1L);
                dto.setUserName("user");
                dto.setFirstName("first");
                dto.setLastName("last");
                dto.setEmail("email");
                dto.setRole("role");
                dto.setAvatarBase64("b64");
                assertEquals(Long.valueOf(1L), dto.getId());
                assertEquals("user", dto.getUserName());
                assertEquals("first", dto.getFirstName());
                assertEquals("last", dto.getLastName());
                assertEquals("email", dto.getEmail());
                assertEquals("role", dto.getRole());
                assertEquals("b64", dto.getAvatarBase64());
            }

            @Test
            public void testResumeUserDto_Constructor() {
                ResumeUserDto dto = new ResumeUserDto(2L, "u", "f", "l", "e", "r", "b");
                assertEquals(Long.valueOf(2L), dto.getId());
                assertEquals("u", dto.getUserName());
                assertEquals("f", dto.getFirstName());
                assertEquals("l", dto.getLastName());
                assertEquals("e", dto.getEmail());
                assertEquals("r", dto.getRole());
                assertEquals("b", dto.getAvatarBase64());
            }

            @Test
            public void testSearchExerciseForRoutineDto_GettersSetters() {
                SearchExerciseForRoutineDto dto = new SearchExerciseForRoutineDto();
                dto.setName("name");
                dto.setNumeroSeries(5);
                assertEquals("name", dto.getName());
                assertEquals(5, dto.getNumeroSeries());
            }

            @Test
            public void testSearchExerciseForRoutineDto_Constructor() {
                SearchExerciseForRoutineDto dto = new SearchExerciseForRoutineDto("n", 7);
                assertEquals("n", dto.getName());
                assertEquals(7, dto.getNumeroSeries());
            }

            @Test
            public void testSerieSummaryDto_GettersSetters() {
                SerieSummaryDto dto = new SerieSummaryDto();
                dto.setId(1L);
                dto.setNumeroSerie(2);
                dto.setRepeticiones(3);
                dto.setPeso(4);
                assertEquals(Long.valueOf(1L), dto.getId());
                assertEquals(2, dto.getNumeroSerie());
                assertEquals(3, dto.getRepeticiones());
                assertEquals(4, dto.getPeso());
            }

            @Test
            public void testSerieSummaryDto_Constructor() {
                SerieSummaryDto dto = new SerieSummaryDto(5L, 6, 7, 8);
                assertEquals(Long.valueOf(5L), dto.getId());
                assertEquals(6, dto.getNumeroSerie());
                assertEquals(7, dto.getRepeticiones());
                assertEquals(8, dto.getPeso());
            }

            @Test
            public void testUserRegisterParamsDto_GettersSetters() {
                UserRegisterParamsDto dto = new UserRegisterParamsDto();
                dto.setUserName("user");
                dto.setPassword("pass");
                dto.setFirstName("first");
                dto.setLastName("last");
                dto.setEmail("email");
                dto.setRole("role");
                dto.setHeight(1.75f);
                dto.setWeight(70.5f);
                dto.setGender("M");
                dto.setBirthDate("2000-01-01");
                assertEquals("user", dto.getUserName());
                assertEquals("pass", dto.getPassword());
                assertEquals("first", dto.getFirstName());
                assertEquals("last", dto.getLastName());
                assertEquals("email", dto.getEmail());
                assertEquals("role", dto.getRole());
                assertEquals(1.75f, dto.getHeight(), 0.001f);
                assertEquals(70.5f, dto.getWeight(), 0.001f);
                assertEquals("M", dto.getGender());
                assertEquals("2000-01-01", dto.getBirthDate());
            }

            @Test
            public void testUserRegisterParamsDto_Constructor() {
                UserRegisterParamsDto dto = new UserRegisterParamsDto("u", "p", "f", "l", "e", "r", 1.6f, 60.2f, "F", "1999-12-31");
                assertEquals("u", dto.getUserName());
                assertEquals("p", dto.getPassword());
                assertEquals("f", dto.getFirstName());
                assertEquals("l", dto.getLastName());
                assertEquals("e", dto.getEmail());
                assertEquals("r", dto.getRole());
                assertEquals(1.6f, dto.getHeight(), 0.001f);
                assertEquals(60.2f, dto.getWeight(), 0.001f);
                assertEquals("F", dto.getGender());
                assertEquals("1999-12-31", dto.getBirthDate());
            }
        @Test
        public void testRoutineDetailsDto_GettersSetters() {
            RoutineDetailsDto dto = new RoutineDetailsDto();
            dto.setId(1L);
            dto.setName("Routine");
            List<ExerciseRoutineDto> exercises = new ArrayList<>();
            dto.setExercises(exercises);
            dto.setCreator("creator");
            dto.setCreatorAvatarBase64("avatarBase64");
            dto.setDuration(60L);
            java.time.LocalDateTime modDate = java.time.LocalDateTime.now();
            dto.setModificationDate(modDate);
            dto.setIsPublic(true);
            assertEquals(Long.valueOf(1L), dto.getId());
            assertEquals("Routine", dto.getName());
            assertEquals(exercises, dto.getExercises());
            assertEquals("creator", dto.getCreator());
            assertEquals("avatarBase64", dto.getCreatorAvatarBase64());
            assertEquals(Long.valueOf(60L), dto.getDuration());
            assertEquals(modDate, dto.getModificationDate());
            assertTrue(dto.getIsPublic());
        }

        @Test
        public void testRoutineDetailsDto_Constructor() {
            List<ExerciseRoutineDto> exercises = new ArrayList<>();
            java.time.LocalDateTime modDate = java.time.LocalDateTime.now();
            RoutineDetailsDto dto = new RoutineDetailsDto(2L, "Rutina", exercises, "Creador", "avatarB64", 45L, modDate, false);
            assertEquals(Long.valueOf(2L), dto.getId());
            assertEquals("Rutina", dto.getName());
            assertEquals(exercises, dto.getExercises());
            assertEquals("Creador", dto.getCreator());
            assertEquals("avatarB64", dto.getCreatorAvatarBase64());
            assertEquals(Long.valueOf(45L), dto.getDuration());
            assertEquals(modDate, dto.getModificationDate());
            assertFalse(dto.getIsPublic());
        }

        @Test
        public void testTrainingDetailsDto_GettersSetters() {
            TrainingDetailsDto dto = new TrainingDetailsDto();
            dto.setId(1L);
            dto.setName("Training");
            dto.setDuration(30L);
            dto.setDescription("desc");

            List<ExerciseRoutineDto> exercises = new ArrayList<>();
            dto.setExercises(exercises);

            java.time.LocalDateTime creationDate = java.time.LocalDateTime.now();
            dto.setCreationDate(creationDate);

            dto.setCreatorId(2L);
            dto.setCreatorUserName("user");
            dto.setCreatorAvatarBase64("base64avatar");

            dto.setRoutineId(3L);
            dto.setRoutineName("routineName");
            dto.setPublic(true);

            assertEquals(Long.valueOf(1L), dto.getId());
            assertEquals("Training", dto.getName());
            assertEquals(Long.valueOf(30L), dto.getDuration());
            assertEquals("desc", dto.getDescription());
            assertEquals(exercises, dto.getExercises());
            assertEquals(creationDate, dto.getCreationDate());
            assertEquals(Long.valueOf(2L), dto.getCreatorId());
            assertEquals("user", dto.getCreatorUserName());
            assertEquals("base64avatar", dto.getCreatorAvatarBase64());
            assertEquals(Long.valueOf(3L), dto.getRoutineId());
            assertEquals("routineName", dto.getRoutineName());
            assertTrue(dto.isPublic());
        }

        @Test
        public void testTrainingDetailsDto_Constructor() {
            List<ExerciseRoutineDto> exercises = new ArrayList<>();
            java.time.LocalDateTime creationDate = java.time.LocalDateTime.now();

            TrainingDetailsDto dto = new TrainingDetailsDto(Long.valueOf(10), "Entrenamiento", "desc", Long.valueOf(90), creationDate, Long.valueOf(5), "user", null, Long.valueOf(6), "rutina", exercises, false, true);

            assertEquals(Long.valueOf(10L), dto.getId());
            assertEquals("Entrenamiento", dto.getName());
            assertEquals(Long.valueOf(90L), dto.getDuration());
            assertEquals("desc", dto.getDescription());
            assertEquals(exercises, dto.getExercises());
            assertEquals(creationDate, dto.getCreationDate());
            assertEquals(Long.valueOf(5L), dto.getCreatorId());
            assertEquals("user", dto.getCreatorUserName());
            assertEquals(Long.valueOf(6L), dto.getRoutineId());
            assertEquals("rutina", dto.getRoutineName());
            assertFalse(dto.isPublic());
            assertTrue(dto.isRoutineIsPublic());
            assertNull(dto.getCreatorAvatarBase64());
        }

        @Test
        public void testSearchSuggestionDto_GettersSetters() {
            SearchSuggestionDto dto = new SearchSuggestionDto();
            dto.setId(1L);
            dto.setType("type");
            dto.setName("name");
            assertEquals(Long.valueOf(1L), dto.getId());
            assertEquals("type", dto.getType());
            assertEquals("name", dto.getName());
        }

        @Test
        public void testSearchSuggestionDto_Constructor() {
            SearchSuggestionDto dto = new SearchSuggestionDto(2L, "tipo", "nombre");
            assertEquals(Long.valueOf(2L), dto.getId());
            assertEquals("tipo", dto.getType());
            assertEquals("nombre", dto.getName());
        }
    @Test
    public void testFollowRequestDto_GettersSetters() {
        FollowRequestDto dto = new FollowRequestDto();
        dto.setId(10L);
        dto.setSenderId(20L);
        dto.setSenderUserName("sender");
        dto.setReceiverId(30L);
        dto.setReceiverUserName("receiver");
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        dto.setCreatedAt(now);
        dto.setAccepted(true);
        assertEquals(Long.valueOf(10L), dto.getId());
        assertEquals(Long.valueOf(20L), dto.getSenderId());
        assertEquals("sender", dto.getSenderUserName());
        assertEquals(Long.valueOf(30L), dto.getReceiverId());
        assertEquals("receiver", dto.getReceiverUserName());
        assertEquals(now, dto.getCreatedAt());
        assertTrue(dto.isAccepted());
    }

    @Test
    public void testExerciseSummaryDto_GettersSetters() {
        ExerciseSummaryDto dto = new ExerciseSummaryDto();
        dto.setId(1L);
        dto.setName("name");
        dto.setDescripcion("desc");
        dto.setGrupoMuscular(null);
        dto.setOwnerName("owner");
        AvatarDto avatar = new AvatarDto("avatar", "base64");
        dto.setOwnerAvatar(avatar);
        assertEquals(Long.valueOf(1L), dto.getId());
        assertEquals("name", dto.getName());
        assertEquals("desc", dto.getDescripcion());
        assertNull(dto.getGrupoMuscular());
        assertEquals("owner", dto.getOwnerName());
        assertEquals(avatar, dto.getOwnerAvatar());
    }

    @Test
    public void testExerciseRoutineParamsDto_GettersSetters() {
        ExerciseRoutineParamsDto dto = new ExerciseRoutineParamsDto();
        dto.setId(1L);
        dto.setName("routine");
        List<SerieParamsDto> series = new ArrayList<>();
        dto.setSeries(series);
        assertEquals(Long.valueOf(1L), dto.getId());
        assertEquals("routine", dto.getName());
        assertEquals(series, dto.getSeries());
    }

    @Test
    public void testChangePasswordParamsDto_GettersSetters() {
        ChangePasswordParamsDto dto = new ChangePasswordParamsDto();
        dto.setOldPassword("old");
        dto.setNewPassword("new");
        assertEquals("old", dto.getOldPassword());
        assertEquals("new", dto.getNewPassword());
    }

    @Test
    public void testCalendarTrainingDto_GettersSetters() {
        CalendarTrainingDto dto = new CalendarTrainingDto(LocalDate.of(2025, 1, 1), "title");
        dto.setDate(LocalDate.of(2025, 2, 2));
        dto.setTitle("newtitle");
        assertEquals(LocalDate.of(2025, 2, 2), dto.getDate());
        assertEquals("newtitle", dto.getTitle());
    }

    @Test
    public void testBlockedByUserDto_GettersSetters() {
        BlockedByUserDto dto = new BlockedByUserDto(1L, 2L, 3L, java.time.LocalDateTime.now());
        dto.setId(10L);
        dto.setIdBlocked(20L);
        dto.setIdBlocker(30L);
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        dto.setDate(now);
        assertEquals(Long.valueOf(10L), dto.getId());
        assertEquals(Long.valueOf(20L), dto.getIdBlocked());
        assertEquals(Long.valueOf(30L), dto.getIdBlocker());
        assertEquals(now, dto.getDate());
    }

    @Test
    public void testBlockDto_GettersSetters() {
        BlockDto<String> dto = new BlockDto<>();
        List<String> items = new ArrayList<>();
        items.add("item");
        dto.setItems(items);
        dto.setExistMoreItems(true);
        assertEquals(items, dto.getItems());
        assertTrue(dto.getExistMoreItems());
    }

    @Test
    public void testImageDto_GettersSetters() {
        ImageDto dto = new ImageDto();
        dto.setName("img");
        dto.setBase64("b64");
        assertEquals("img", dto.getName());
        assertEquals("b64", dto.getBase64());
    }

    @Test
    public void testAvatarDto_GettersSetters() {
        AvatarDto dto = new AvatarDto();
        dto.setName("avatar");
        dto.setAvatarBase64("b64");
        assertEquals("avatar", dto.getName());
        assertEquals("b64", dto.getAvatarBase64());
    }

    @Test
    public void testAuthenticatedUserDto_GettersSetters() {
        AuthenticatedUserDto dto = new AuthenticatedUserDto();
        dto.setServiceToken("token");
        UserDto user = null;
        dto.setUserDto(user);
        assertEquals("token", dto.getServiceToken());
        assertEquals(user, dto.getUserDto());
    }

    @Test
    public void testLoginParamsDto_GettersSetters() {
        LoginParamsDto dto = new LoginParamsDto();
        dto.setUserName("user");
        dto.setPassword("pass");
        assertEquals("user", dto.getUserName());
        assertEquals("pass", dto.getPassword());
    }

    @Test
    public void testNotificationDto_GettersSetters() {
        NotificationDto dto = new NotificationDto(1L, 2L, 2L, "msg", true, "date");
        dto.setId(10L);
        dto.setRoutineId(20L);
        dto.setTrainingId(25L);
        dto.setMessage("newmsg");
        dto.setRead(false);
        dto.setDate("newdate");
        assertEquals(Long.valueOf(10L), dto.getId());
        assertEquals(Long.valueOf(20L), dto.getRoutineId());
        assertEquals(Long.valueOf(25L), dto.getTrainingId());
        assertEquals("newmsg", dto.getMessage());
        assertFalse(dto.isRead());
        assertEquals("newdate", dto.getDate());
    }

    @Test
    public void testCalendarStatsDto_Constructor() {
        List<CalendarTrainingDto> trainings = new ArrayList<>();
        CalendarTrainingDto dto = new CalendarTrainingDto(LocalDate.now(), "New Year Training");
        trainings.add(dto);
        CalendarStatsDto statsDto = new CalendarStatsDto(trainings);
        assertEquals(trainings, statsDto.getTrainings());
    }

    @Test
    public void testCalendarStatsDto_GettersSetters() {
        List<CalendarTrainingDto> trainings = new ArrayList<>();
        CalendarStatsDto statsDto = new CalendarStatsDto();
        statsDto.setTrainings(trainings);
        assertEquals(trainings, statsDto.getTrainings());
    }

    @Test
    public void testCalendarTrainingDto() {
        LocalDate date = LocalDate.of(2025, 1, 1);
        String title = "Test Training";
        CalendarTrainingDto dto = new CalendarTrainingDto(date, title);
        assertEquals(date, dto.getDate());
        assertEquals(title, dto.getTitle());
        LocalDate newDate = LocalDate.of(2025, 2, 2);
        String newTitle = "Updated Training";
        dto.setDate(newDate);
        dto.setTitle(newTitle);
        assertEquals(newDate, dto.getDate());
        assertEquals(newTitle, dto.getTitle());
    }

    @Test
    public void testFollowRequestDto() {
        Long id = 1L;
        Long senderId = 2L;
        String senderUserName = "sender";
        Long receiverId = 3L;
        String receiverUserName = "receiver";
        java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();
        boolean accepted = true;
        FollowRequestDto dto = new FollowRequestDto(id, senderId, senderUserName, receiverId, receiverUserName, createdAt, accepted);
        assertEquals(id, dto.getId());
        assertEquals(senderId, dto.getSenderId());
        assertEquals(senderUserName, dto.getSenderUserName());
        assertEquals(receiverId, dto.getReceiverId());
        assertEquals(receiverUserName, dto.getReceiverUserName());
        assertEquals(createdAt, dto.getCreatedAt());
        assertEquals(accepted, dto.isAccepted());
    }

    @Test
    public void testExerciseSummaryDto() {
        Long id = 1L;
        String name = "Push Up";
        String descripcion = "Chest exercise";
        es.udc.fi.dc.fd.model.entities.Exercise.grupoMuscular grupo = null;
        String ownerName = "owner";
        AvatarDto avatar = new AvatarDto("avatar", "base64");
        ExerciseSummaryDto dto = new ExerciseSummaryDto(id, name, descripcion, grupo, ownerName, avatar);
        assertEquals(id, dto.getId());
        assertEquals(name, dto.getName());
        assertEquals(descripcion, dto.getDescripcion());
        assertEquals(grupo, dto.getGrupoMuscular());
        assertEquals(ownerName, dto.getOwnerName());
        assertEquals(avatar, dto.getOwnerAvatar());
    }

    @Test
    public void testExerciseRoutineParamsDto() {
        Long id = 1L;
        String name = "Routine";
        List<SerieParamsDto> series = new ArrayList<>();
        ExerciseRoutineParamsDto dto = new ExerciseRoutineParamsDto(id, name, series);
        assertEquals(id, dto.getId());
        assertEquals(name, dto.getName());
        assertEquals(series, dto.getSeries());
    }

    @Test
    public void testChangePasswordParamsDto() {
        ChangePasswordParamsDto dto = new ChangePasswordParamsDto();
        dto.setOldPassword("oldpass");
        dto.setNewPassword("newpass");
        assertEquals("oldpass", dto.getOldPassword());
        assertEquals("newpass", dto.getNewPassword());
    }

    @Test
    public void testBlockedByUserDto() {
        Long id = 1L;
        Long idBlocked = 2L;
        Long idBlocker = 3L;
        java.time.LocalDateTime date = java.time.LocalDateTime.now();
        BlockedByUserDto dto = new BlockedByUserDto(id, idBlocked, idBlocker, date);
        assertEquals(id, dto.getId());
        assertEquals(idBlocked, dto.getIdBlocked());
        assertEquals(idBlocker, dto.getIdBlocker());
        assertEquals(date, dto.getDate());
    }

    @Test
    public void testBlockDto() {
        List<String> items = new ArrayList<>();
        items.add("item1");
        BlockDto<String> dto = new BlockDto<>(items, true);
        assertEquals(items, dto.getItems());
        assertEquals(true, dto.getExistMoreItems());
        dto.setExistMoreItems(false);
        assertEquals(false, dto.getExistMoreItems());
    }

    @Test
    public void testImageDto() {
        ImageDto dto = new ImageDto("img", "base64");
        assertEquals("img", dto.getName());
        assertEquals("base64", dto.getBase64());
        dto.setName("img2");
        dto.setBase64("b2");
        assertEquals("img2", dto.getName());
        assertEquals("b2", dto.getBase64());
    }

    @Test
    public void testAvatarDto() {
        AvatarDto dto = new AvatarDto("avatar", "base64");
        assertEquals("avatar", dto.getName());
        assertEquals("base64", dto.getAvatarBase64());
        dto.setName("avatar2");
        dto.setAvatarBase64("b2");
        assertEquals("avatar2", dto.getName());
        assertEquals("b2", dto.getAvatarBase64());
    }

    @Test
    public void testAuthenticatedUserDto() {
        UserDto user = null;
        AuthenticatedUserDto dto = new AuthenticatedUserDto("token", user);
        assertEquals("token", dto.getServiceToken());
        assertEquals(user, dto.getUserDto());
    }

    @Test
    public void testNotificationDto() {
        Long id = 1L;
        Long routineId = 2L;
        Long trainingId = 3L;
        String message = "msg";
        boolean isRead = true;
        String date = "2025-11-22";
        NotificationDto dto = new NotificationDto(id, routineId, trainingId, message, isRead, date);
        assertEquals(id, dto.getId());
        assertEquals(routineId, dto.getRoutineId());
        assertEquals(trainingId, dto.getTrainingId());
        assertEquals(message, dto.getMessage());
        assertEquals(isRead, dto.isRead());
        assertEquals(date, dto.getDate());
    }

    @Test
    public void testToRoutineDto_basic() {
        // Mock Routine
        Routine routine = new Routine();
        routine.setId(1L);
        routine.setName("Rutina");
        routine.setRoutineExercises(new ArrayList<>());
        Users creator = new Users();
        creator.setUserName("user");
        Avatar avatar = new Avatar();
        avatar.setAvatarBase64("b64");
        creator.setAvatar(avatar);
        routine.setCreator(creator);
        routine.setDuration(30L);
        routine.setModificationDate(java.time.LocalDateTime.now());
        routine.setIsPublic(true);

        RoutineDto dto = RoutineConversor.toRoutineDto(routine);
        assertEquals(Long.valueOf(1L), dto.getId());
        assertEquals("Rutina", dto.getName());
        assertEquals("b64", dto.getCreatorAvatarBase64());
        assertEquals(Long.valueOf(30L), dto.getDuration());
        assertTrue(dto.getIsPublic());
    }


    @Test
    public void testToRoutineDtos_list() {
        List<Routine> routines = new ArrayList<>();
        Routine r = new Routine();
        r.setId(3L);
        r.setName("R3");
        r.setRoutineExercises(new ArrayList<>());
        Users creator = new Users();
        creator.setUserName("u3");
        creator.setAvatar(null);
        r.setCreator(creator);
        r.setDuration(50L);
        r.setModificationDate(java.time.LocalDateTime.now());
        r.setIsPublic(true);
        routines.add(r);

        List<RoutineDto> dtos = RoutineConversor.toRoutineDtos(routines);
        assertEquals(1, dtos.size());
        assertEquals(Long.valueOf(3L), dtos.get(0).getId());
    }

    @Test
    public void testExercisesStatsDto() {
        LocalDate date = LocalDate.now();
        Map<String, Integer> weights = new HashMap<>();
        weights.put("ex1", 10);
        Map<String, String> groups = new HashMap<>();
        groups.put("ex1", "group1");
        Map<String, Boolean> isPR = new HashMap<>();
        isPR.put("ex1", true);

        ExercisesStatsDto dto = new ExercisesStatsDto(date, weights, groups, isPR);
        assertEquals(date, dto.getDate());
        assertEquals(weights, dto.getExerciseWeightsKg());
        assertEquals(groups, dto.getExerciseGroup());
        assertEquals(isPR, dto.getIsPR());

        dto.setDate(date.plusDays(1));
        dto.setExerciseWeightsKg(null);
        dto.setExerciseGroup(null);
        dto.setIsPR(null);

        assertEquals(date.plusDays(1), dto.getDate());
        assertNull(dto.getExerciseWeightsKg());
        assertNull(dto.getExerciseGroup());
        assertNull(dto.getIsPR());
        
        ExercisesStatsDto emptyDto = new ExercisesStatsDto();
        assertNull(emptyDto.getDate());
    }

    @Test
    public void testMuscularGroupsStatsDto() {
        LocalDate date = LocalDate.now();
        Map<String, Integer> counts = new HashMap<>();
        counts.put("group1", 5);

        MuscularGroupsStatsDto dto = new MuscularGroupsStatsDto(date, counts);
        assertEquals(date, dto.getDate());
        assertEquals(counts, dto.getExerciseCount());

        dto.setDate(date.plusDays(1));
        dto.setExerciseCount(null);

        assertEquals(date.plusDays(1), dto.getDate());
        assertNull(dto.getExerciseCount());

        MuscularGroupsStatsDto emptyDto = new MuscularGroupsStatsDto();
        assertNull(emptyDto.getDate());
    }

    @Test
    public void testPeriodExerciseStatsDto() {
        LocalDate date = LocalDate.now();
        List<ExercisesStatsDto> list = new ArrayList<>();

        PeriodExerciseStatsDto dto = new PeriodExerciseStatsDto(date, list);
        assertEquals(date, dto.getStartDate());
        assertEquals(list, dto.getExerciseStats());

        dto.setStartDate(date.plusDays(1));
        dto.setExerciseStats(null);

        assertEquals(date.plusDays(1), dto.getStartDate());
        assertNull(dto.getExerciseStats());

        PeriodExerciseStatsDto emptyDto = new PeriodExerciseStatsDto();
        assertNull(emptyDto.getStartDate());
    }

    @Test
    public void testPeriodMuscularGroupStatsDto() {
        LocalDate date = LocalDate.now();
        List<MuscularGroupsStatsDto> list = new ArrayList<>();

        PeriodMuscularGroupStatsDto dto = new PeriodMuscularGroupStatsDto(date, list);
        assertEquals(date, dto.getStartDate());
        assertEquals(list, dto.getMuscularGroupStats());

        dto.setStartDate(date.plusDays(1));
        dto.setMuscularGroupStats(null);

        assertEquals(date.plusDays(1), dto.getStartDate());
        assertNull(dto.getMuscularGroupStats());

        PeriodMuscularGroupStatsDto emptyDto = new PeriodMuscularGroupStatsDto();
        assertNull(emptyDto.getStartDate());
    }

    @Test
    public void testUserStatsDto() {
        Long userId = 1L;
        String period = "MONTH";
        List<ImageDto> images = new ArrayList<>();
        List<PeriodExerciseStatsDto> exStats = new ArrayList<>();
        List<PeriodMuscularGroupStatsDto> musStats = new ArrayList<>();

        UserStatsDto dto = new UserStatsDto(userId, period, images, exStats, musStats);
        assertEquals(userId, dto.getUserId());
        assertEquals(period, dto.getPeriod());
        assertEquals(images, dto.getMuscleGroupImages());
        assertEquals(exStats, dto.getPeriodExerciseStats());
        assertEquals(musStats, dto.getPeriodMuscularGroupStats());

        dto.setUserId(2L);
        dto.setPeriod("YEAR");
        dto.setMuscleGroupImages(null);
        dto.setPeriodExerciseStats(null);
        dto.setPeriodMuscularGroupStats(null);

        assertEquals(Long.valueOf(2L), dto.getUserId());
        assertEquals("YEAR", dto.getPeriod());
        assertNull(dto.getMuscleGroupImages());
        assertNull(dto.getPeriodExerciseStats());
        assertNull(dto.getPeriodMuscularGroupStats());

        UserStatsDto emptyDto = new UserStatsDto();
        assertNull(emptyDto.getUserId());
    }

    @Test
    public void testUserStatsParamsDto() {
        Long profileId = 1L;
        int reps = 10;
        String period = "WEEK";

        UserStatsParamsDto dto = new UserStatsParamsDto(profileId, reps, period);
        assertEquals(profileId, dto.getUserProfileId());
        assertEquals(reps, dto.getNumReps());
        assertEquals(period, dto.getPeriod());

        dto.setUserProfileId(2L);
        dto.setNumReps(5);
        dto.setPeriod("MONTH");

        assertEquals(Long.valueOf(2L), dto.getUserProfileId());
        assertEquals(5, dto.getNumReps());
        assertEquals("MONTH", dto.getPeriod());

        UserStatsParamsDto emptyDto = new UserStatsParamsDto();
        assertNull(emptyDto.getUserProfileId());
    }

    @Test
    public void testToTrainingDetailsDto() {
        // Creator
        Users user = new Users();
        user.setId(5L);
        user.setUserName("creator");

        Avatar avatar = new Avatar();
        avatar.setAvatarBase64("avatarBase64");
        user.setAvatar(avatar);

        // Training
        Training training = new Training();
        training.setId(10L);
        training.setName("Training test");
        training.setDescription("desc");
        training.setDuration(45L);
        java.time.LocalDateTime creationDate = java.time.LocalDateTime.now();
        training.setCreationDate(creationDate);
        training.setUser(user);
        training.setIsPublic(true);

        // Routine
        Routine routine = new Routine();
        routine.setId(20L);
        routine.setName("Routine test");

        // Exercises
        List<ExerciseRoutineDto> exercises = new ArrayList<>();

        TrainingDetailsDto dto = RoutineConversor.toTrainingDetailsDto(
            training, exercises, routine
        );

        assertEquals(Long.valueOf(10L), dto.getId());
        assertEquals("Training test", dto.getName());
        assertEquals("desc", dto.getDescription());
        assertEquals(Long.valueOf(45L), dto.getDuration());
        assertEquals(creationDate, dto.getCreationDate());

        assertEquals(Long.valueOf(5L), dto.getCreatorId());
        assertEquals("creator", dto.getCreatorUserName());
        assertEquals("avatarBase64", dto.getCreatorAvatarBase64());

        assertEquals(Long.valueOf(20L), dto.getRoutineId());
        assertEquals("Routine test", dto.getRoutineName());

        assertEquals(exercises, dto.getExercises());
        assertTrue(dto.isPublic());
    }

    @Test
    public void testToTrainingDetailsDto_withoutAvatar() {
        Users user = new Users();
        user.setId(6L);
        user.setUserName("creator2");
        user.setAvatar(null);

        Training training = new Training();
        training.setId(11L);
        training.setName("Training no avatar");
        training.setDescription("desc");
        training.setDuration(30L);
        java.time.LocalDateTime creationDate = java.time.LocalDateTime.now();
        training.setCreationDate(creationDate);
        training.setUser(user);
        training.setIsPublic(false);

        Routine routine = new Routine();
        routine.setId(21L);
        routine.setName("Routine no avatar");

        List<ExerciseRoutineDto> exercises = new ArrayList<>();

        TrainingDetailsDto dto = RoutineConversor.toTrainingDetailsDto(
            training, exercises, routine
        );

        assertNull(dto.getCreatorAvatarBase64());
        assertFalse(dto.isPublic());
    }

}
