
package es.udc.fi.dc.fd.model.entities;

import org.junit.Test;
import static org.junit.Assert.*;
import java.time.LocalDateTime;

import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import jakarta.transaction.Transactional;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class EntitiesTest {

	@Test
	public void testRoutineExerciseIdEqualsAndHashCode() {
		RoutineExerciseId id1 = new RoutineExerciseId(1L, 2L);
		RoutineExerciseId id2 = new RoutineExerciseId(1L, 2L);
		RoutineExerciseId id3 = new RoutineExerciseId(2L, 1L);
		assertEquals(id1, id2);
		assertNotEquals(id1, id3);
		assertEquals(id1.hashCode(), id2.hashCode());
		assertNotEquals(id1.hashCode(), id3.hashCode());
	}

	@Test
	public void testRoutineExerciseIdGettersSetters() {
		RoutineExerciseId id = new RoutineExerciseId();
		id.setRoutineId(10L);
		id.setExerciseId(20L);
		assertEquals(Long.valueOf(10L), id.getRoutineId());
		assertEquals(Long.valueOf(20L), id.getExerciseId());
	}

	@Test
	public void testNotificationGettersSetters() {
		Users receiver = new Users();
		Users sender = new Users();
		Routine routine = new Routine();
		Training training = new Training();
		String message = "Test message";
		Boolean isRead = false;
		LocalDateTime date = LocalDateTime.now();
		Notification notification = new Notification(receiver, sender, routine, training, message, isRead, date);
		notification.setId(100L);
		assertEquals(Long.valueOf(100L), notification.getId());
		assertEquals(receiver, notification.getReceiver());
		assertEquals(sender, notification.getSender());
		assertEquals(routine, notification.getRoutine());
		assertEquals(training, notification.getTraining());
		assertEquals(message, notification.getMessage());
		assertEquals(isRead, notification.getIsRead());
		assertEquals(date, notification.getDate());
	}

	@Test
	public void testNotificationDefaultConstructorAndSetters() {
		Notification notification = new Notification();
		Users receiver = new Users();
		Users sender = new Users();
		Routine routine = new Routine();
		String message = "Hello";
		Boolean isRead = true;
		LocalDateTime date = LocalDateTime.now();
		notification.setReceiver(receiver);
		notification.setSender(sender);
		notification.setRoutine(routine);
		notification.setMessage(message);
		notification.setIsRead(isRead);
		notification.setDate(date);
		notification.setId(200L);
		assertEquals(receiver, notification.getReceiver());
		assertEquals(sender, notification.getSender());
		assertEquals(routine, notification.getRoutine());
		assertEquals(message, notification.getMessage());
		assertEquals(isRead, notification.getIsRead());
		assertEquals(date, notification.getDate());
		assertEquals(Long.valueOf(200L), notification.getId());
	}
	@Test
	public void testAvatarGettersSetters() {
		Avatar avatar = new Avatar();
		avatar.setId(1L);
		avatar.setName("TestAvatar");
		avatar.setAvatarBase64("base64string");
		assertEquals(Long.valueOf(1L), avatar.getId());
		assertEquals("TestAvatar", avatar.getName());
		assertEquals("base64string", avatar.getAvatarBase64());
	}

	@Test
	public void testAvatarConstructor() {
		Avatar avatar = new Avatar("AvatarName", "imgbase64");
		assertNull(avatar.getId());
		assertEquals("AvatarName", avatar.getName());
		assertEquals("imgbase64", avatar.getAvatarBase64());
	}

	@Test
	public void testBlockUserGettersSetters() {
		BlockUser blockUser = new BlockUser();
		blockUser.setId(10L);
		blockUser.setIdBlocker(20L);
		blockUser.setIdBlocked(30L);
		LocalDateTime now = LocalDateTime.now().withNano(0);
		blockUser.setDateBlock(now);
		assertEquals(Long.valueOf(10L), blockUser.getId());
		assertEquals(Long.valueOf(20L), blockUser.getIdBlocker());
		assertEquals(Long.valueOf(30L), blockUser.getIdBlocked());
		assertEquals(now, blockUser.getDateBlock());
	}

	@Test
	public void testBlockUserConstructor() {
		BlockUser blockUser = new BlockUser(100L, 200L);
		assertNull(blockUser.getId());
		assertEquals(Long.valueOf(100L), blockUser.getIdBlocker());
		assertEquals(Long.valueOf(200L), blockUser.getIdBlocked());
		assertNotNull(blockUser.getDateBlock());
	}


	@Test
	public void testRoutineFollowIdEqualsSameObject() {
		RoutineFollowId id1 = new RoutineFollowId(1L, 2L);
		assertEquals(id1, id1);
	}

	@Test
	public void testRoutineFollowIdEqualsNull() {
		RoutineFollowId id1 = new RoutineFollowId(1L, 2L);
		assertNotEquals(id1, null);
	}

	@Test
	public void testRoutineFollowIdEqualsDifferentClass() {
		RoutineFollowId id1 = new RoutineFollowId(1L, 2L);
		String notAnId = "not an id";
		assertNotEquals(id1, notAnId);
	}

	@Test
	public void testRoutineFollowIdDefaultConstructor() {
		RoutineFollowId id = new RoutineFollowId();
		assertNotNull(id);
	}

	@Test
	public void testRoutineLikeIdEqualsAndHashCode() {
		RoutineLikeId id1 = new RoutineLikeId(1L, 2L);
		RoutineLikeId id2 = new RoutineLikeId(1L, 2L);
		RoutineLikeId id3 = new RoutineLikeId(2L, 1L);
		assertEquals(id1, id2);
		assertNotEquals(id1, id3);
		assertEquals(id1.hashCode(), id2.hashCode());
		assertNotEquals(id1.hashCode(), id3.hashCode());
	}

	@Test
	public void testRoutineLikeIdGettersSetters() {
		RoutineLikeId id = new RoutineLikeId();
		id.setUserId(10L);
		id.setRoutineId(20L);
		assertEquals(Long.valueOf(10L), id.getUserId());
		assertEquals(Long.valueOf(20L), id.getRoutineId());
	}

	@Test
	public void testRoutineLikeIdEqualsSameObject() {
		RoutineLikeId id1 = new RoutineLikeId(1L, 2L);
		assertEquals(id1, id1);
	}

	@Test
	public void testRoutineLikeIdEqualsNull() {
		RoutineLikeId id1 = new RoutineLikeId(1L, 2L);
		assertNotEquals(id1, null);
	}

	@Test
	public void testRoutineLikeIdEqualsDifferentClass() {
		RoutineLikeId id1 = new RoutineLikeId(1L, 2L);
		String notAnId = "not an id";
		assertNotEquals(id1, notAnId);
	}

	@Test
	public void testRoutineLikeIdEqualsWithNullFields() {
		RoutineLikeId id1 = new RoutineLikeId(null, null);
		RoutineLikeId id2 = new RoutineLikeId(null, null);
		assertEquals(id1, id2);
		assertEquals(id1.hashCode(), id2.hashCode());
	}

	@Test
	public void testRoutineLikeIdDefaultConstructor() {
		RoutineLikeId id = new RoutineLikeId();
		assertNotNull(id);
	}

	@Test
	public void testRoutineLikeConstructorAndGetters() {
		Users user = new Users();
		user.setId(1L);
		Routine routine = new Routine();
		routine.setId(2L);
		LocalDateTime beforeCreation = LocalDateTime.now();
		RoutineLike like = new RoutineLike(user, routine);
		LocalDateTime afterCreation = LocalDateTime.now();
		assertNotNull(like.getId());
		assertEquals(Long.valueOf(1L), like.getId().getUserId());
		assertEquals(Long.valueOf(2L), like.getId().getRoutineId());
		assertEquals(user, like.getUser());
		assertEquals(routine, like.getRoutine());
		assertNotNull(like.getLikeDate());
		assertTrue(like.getLikeDate().isAfter(beforeCreation.minusSeconds(1)));
		assertTrue(like.getLikeDate().isBefore(afterCreation.plusSeconds(1)));
	}

	@Test
	public void testRoutineLikeDefaultConstructor() {
		RoutineLike like = new RoutineLike();
		assertNotNull(like);
		assertNotNull(like.getId());
	}

	@Test
	public void testRoutineLikeIdConsistency() {
		Users user = new Users();
		user.setId(5L);
		Routine routine = new Routine();
		routine.setId(10L);
		RoutineLike like = new RoutineLike(user, routine);
		assertEquals(user.getId(), like.getId().getUserId());
		assertEquals(routine.getId(), like.getId().getRoutineId());
	}

	@Test
	public void testRoutineLikeDateNotNull() {
		Users user = new Users();
		user.setId(1L);
		Routine routine = new Routine();
		routine.setId(2L);
		RoutineLike like = new RoutineLike(user, routine);
		assertNotNull(like.getLikeDate());
	}
}
