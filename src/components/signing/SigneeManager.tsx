import React from 'react';
import dynamic from 'next/dynamic';
import { User } from '../../types';
import { ColorCircle } from '../ui/ColorCircle';
import { sidebarStyles } from '../../styles/sidebarStyles';

const ActionButton = dynamic(
  () => import("@baseline-ui/core").then((mod) => mod.ActionButton),
  { ssr: false }
);

interface SigneeManagerProps {
  users: User[];
  selectedSignee: User;
  onSigneeChange: (signee: User) => void;
  onAddSignee: () => void;
  onDeleteUser: (user: User) => void;
}

export const SigneeManager: React.FC<SigneeManagerProps> = ({
  users,
  selectedSignee,
  onSigneeChange,
  onAddSignee,
  onDeleteUser
}) => {
  const signers = users.filter(user => user.role !== "Editor");

  return (
    <div style={sidebarStyles.section}>
      <h3 style={sidebarStyles.sectionTitle}>
        Signers
      </h3>
      <div style={sidebarStyles.sectionDescription}
      >
        Select the signer to assign fields to.
      </div>
      
      <div>
        {signers.map((user) => {
          const isSelected = selectedSignee.id === user.id;
          return (
            <div
              key={user.id}
              className={`heading-custom-style_hover ${isSelected ? "highlight-signee" : ""}`}
              onClick={() => onSigneeChange(user)}
            >
              <ColorCircle color={user.color?.toString()} />
              {user?.name.length > 10 ? user?.name.slice(0, 10) + "..." : user?.name}
              <span
                className="cross"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteUser(user);
                }}
              >
                <svg
                  width="10"
                  height="9"
                  viewBox="0 0 10 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.99991 5.43337L1.73324 8.70003C1.61102 8.82225 1.45547 8.88337 1.26658 8.88337C1.07769 8.88337 0.922133 8.82225 0.79991 8.70003C0.677688 8.57781 0.616577 8.42225 0.616577 8.23337C0.616577 8.04448 0.677688 7.88892 0.79991 7.7667L4.06658 4.50003L0.79991 1.23337C0.677688 1.11114 0.616577 0.955588 0.616577 0.766699C0.616577 0.57781 0.677688 0.422255 0.79991 0.300033C0.922133 0.17781 1.07769 0.116699 1.26658 0.116699C1.45547 0.116699 1.61102 0.17781 1.73324 0.300033L4.99991 3.5667L8.26658 0.300033C8.3888 0.17781 8.54435 0.116699 8.73324 0.116699C8.92213 0.116699 9.07769 0.17781 9.19991 0.300033C9.32213 0.422255 9.38324 0.57781 9.38324 0.766699C9.38324 0.955588 9.32213 1.11114 9.19991 1.23337L5.93324 4.50003L9.19991 7.7667C9.32213 7.88892 9.38324 8.04448 9.38324 8.23337C9.38324 8.42225 9.32213 8.57781 9.19991 8.70003C9.07769 8.82225 8.92213 8.88337 8.73324 8.88337C8.54435 8.88337 8.3888 8.82225 8.26658 8.70003L4.99991 5.43337Z"
                    fill="#EF4444"
                  />
                </svg>
              </span>
            </div>
          );
        })}
      </div>
      
      <ActionButton
        label={"+ Add New"}
        size="md"
        onPress={onAddSignee}
        className="custom-button"
        style={{ margin: "15px 0px 0px 0px" }}
      />
    </div>
  );
};