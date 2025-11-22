import cv2
import mediapipe as mp
import numpy as np
from typing import Tuple, Optional

class FaceDetector:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_face_detection = mp.solutions.face_detection
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.face_detection = self.mp_face_detection.FaceDetection(
            model_selection=0,
            min_detection_confidence=0.5
        )

    def detect_face_landmarks(self, image: np.ndarray) -> Optional[Tuple[np.ndarray, float]]:
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results_mesh = self.face_mesh.process(rgb_image)
        if results_mesh.multi_face_landmarks:
            landmarks = []
            confidence = 0.0
            for face_landmarks in results_mesh.multi_face_landmarks:
                for landmark in face_landmarks.landmark:
                    h, w, _ = image.shape
                    x = int(landmark.x * w)
                    y = int(landmark.y * h)
                    landmarks.append([x, y])
                    confidence += getattr(landmark, 'presence', 1.0)
            if landmarks:
                confidence /= len(landmarks)
                return np.array(landmarks), confidence
        results_detection = self.face_detection.process(rgb_image)
        if results_detection.detections:
            detection = results_detection.detections[0]
            bbox = detection.location_data.relative_bounding_box
            h, w, _ = image.shape
            landmarks = [
                [int(bbox.xmin * w), int(bbox.ymin * h)],
                [int((bbox.xmin + bbox.width) * w), int(bbox.ymin * h)],
                [int((bbox.xmin + bbox.width) * w), int((bbox.ymin + bbox.height) * h)],
                [int(bbox.xmin * w), int((bbox.ymin + bbox.height) * h)],
                [int((bbox.xmin + bbox.width/2) * w), int(bbox.ymin * h)],
                [int((bbox.xmin + bbox.width/2) * w), int((bbox.ymin + bbox.height) * h)]
            ]
            return np.array(landmarks), detection.score[0]
        return None

class HeadPoseEstimator:
    def __init__(self):
        self.face_3d_model = np.array([
            [0.0, 0.0, 0.0],
            [0.0, -330.0, -65.0],
            [-225.0, 170.0, -135.0],
            [225.0, 170.0, -135.0],
            [-150.0, -150.0, -125.0],
            [150.0, -150.0, -125.0]
        ], dtype=np.float64)

    def estimate_pose(self, landmarks: np.ndarray, camera_matrix: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        key_points_2d = np.array([
            landmarks[1],
            landmarks[152],
            landmarks[226],
            landmarks[446],
            landmarks[57],
            landmarks[287]
        ], dtype=np.float64)
        success, rvec, tvec = cv2.solvePnP(
            self.face_3d_model,
            key_points_2d,
            camera_matrix,
            None,
            flags=cv2.SOLVEPNP_ITERATIVE
        )
        if success:
            return rvec, tvec
        else:
            return np.zeros(3), np.zeros(3)

class ARRenderer:
    def __init__(self, camera_matrix: np.ndarray):
        self.camera_matrix = camera_matrix
        self.dist_coeffs = np.zeros((4, 1))
    def project_3d_to_2d(self, points_3d: np.ndarray, rvec: np.ndarray, tvec: np.ndarray) -> np.ndarray:
        points_2d, _ = cv2.projectPoints(points_3d, rvec, tvec, self.camera_matrix, self.dist_coeffs)
        return points_2d.reshape(-1, 2)
    def apply_lighting_adaptation(self, image: np.ndarray, overlay: np.ndarray) -> np.ndarray:
        image_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        overlay_gray = cv2.cvtColor(overlay, cv2.COLOR_BGR2GRAY)
        image_mean = np.mean(image_gray)
        overlay_mean = np.mean(overlay_gray)
        if overlay_mean > 0:
            ratio = image_mean / overlay_mean
            overlay = cv2.convertScaleAbs(overlay, alpha=ratio, beta=0)
        return overlay
