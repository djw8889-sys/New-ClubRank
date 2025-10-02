import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";

// MatchWithPlayers 타입 정의가 이 파일 또는 전역 types 파일에 있어야 합니다.
// 예시 타입 정의 (실제 프로젝트의 타입 정의와 일치시켜야 합니다)
interface Player {
  id: string;
  name: string;
}

interface MatchWithPlayers {
  id: string;
  date: string; // 또는 Date
  location: string;
  winnerTeam: "A" | "B";
  teamAScore: number;
  teamBScore: number;
  teamAPlayers: Player[];
  teamBPlayers: Player[];
}

interface MatchResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMatch: MatchWithPlayers | null;
}

const MatchResultModal = ({
  isOpen,
  onClose,
  selectedMatch,
}: MatchResultModalProps) => {
  if (!selectedMatch) return null;

  // selectedMatch 객체에서 직접 속성에 접근합니다.
  const winnerTeamName =
    selectedMatch.winnerTeam === "A" ? "A팀" : "B팀";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            경기 결과
          </ModalHeader>
          <ModalBody>
            <div>
              <h3 className="font-bold">경기 정보</h3>
              <p>날짜: {new Date(selectedMatch.date).toLocaleDateString()}</p>
              <p>장소: {selectedMatch.location}</p>
            </div>
            <div className="mt-4">
              <h3 className="font-bold">승리 팀: {winnerTeamName}</h3>
              <p>
                스코어: {selectedMatch.teamAScore} : {selectedMatch.teamBScore}
              </p>
            </div>
            <div className="mt-4">
              <h3 className="font-bold">참가 선수</h3>
              <div>
                <strong>A팀:</strong>
                <p>{selectedMatch.teamAPlayers.map((p) => p.name).join(", ")}</p>
              </div>
              <div className="mt-2">
                <strong>B팀:</strong>
                <p>{selectedMatch.teamBPlayers.map((p) => p.name).join(", ")}</p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              닫기
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};

export default MatchResultModal;

