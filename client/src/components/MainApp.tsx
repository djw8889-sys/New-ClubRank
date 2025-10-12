import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";

// --- 타입 정의 ---
// 두 컴포넌트에서 공통으로 사용할 타입들을 파일 상단에 정의합니다.
interface Player {
  id: string;
  name: string;
}

interface MatchWithPlayers {
  id: number;
  date: string;
  location: string;
  winnerTeam: "A" | "B";
  teamAScore: number;
  teamBScore: number;
  teamAPlayers: Player[];
  teamBPlayers: Player[];
}


// --- MatchResultModal 컴포넌트 ---
// MainApp 컴포넌트 안에서만 사용되므로, 같은 파일에 정의합니다.
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

  const winnerTeamName = selectedMatch.winnerTeam === "A" ? "A팀" : "B팀";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">경기 결과</ModalHeader>
          <ModalBody>
            <div>
              <h3 className="font-bold">경기 정보</h3>
              <p>날짜: {new Date(selectedMatch.date).toLocaleDateString()}</p>
              <p>장소: {selectedMatch.location}</p>
            </div>
            <div className="mt-4">
              <h3 className="font-bold">승리 팀: {winnerTeamName}</h3>
              <p>스코어: {selectedMatch.teamAScore} : {selectedMatch.teamBScore}</p>
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
            <Button color="danger" variant="light" onPress={onClose}>닫기</Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};


// --- MainApp 컴포넌트 ---
const MainApp = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithPlayers | null>(null);

  const matches: MatchWithPlayers[] = [
    { id: 1, date: '2025-10-02', location: '화성시', winnerTeam: 'A', teamAScore: 21, teamBScore: 15, teamAPlayers: [{id: 'p1', name: '김선수'}], teamBPlayers: [{id: 'p2', name: '이선수'}] },
    { id: 2, date: '2025-10-03', location: '수원시', winnerTeam: 'B', teamAScore: 18, teamBScore: 21, teamAPlayers: [{id: 'p3', name: '박선수'}], teamBPlayers: [{id: 'p4', name: '최선수'}] }
  ];

  const handleOpenModal = (matchId: number) => {
    const matchToShow = matches.find(match => match.id === matchId);
    if (matchToShow) {
      setSelectedMatch(matchToShow);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">경기 목록</h1>
      <ul>
        {matches.map(match => (
          <li key={match.id} onClick={() => handleOpenModal(match.id)} className="cursor-pointer border rounded-lg p-4 mb-2 hover:bg-gray-100 transition-colors">
            <p className="font-semibold">{match.location} 코트</p>
            <p className="text-sm text-gray-600">{new Date(match.date).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>

      <MatchResultModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedMatch={selectedMatch}
      />
    </div>
  );
};

export default MainApp;

