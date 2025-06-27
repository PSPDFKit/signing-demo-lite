import React from 'react';
import dynamic from 'next/dynamic';
import { User, UserSelectorProps } from '../../types';
import { ColorCircle } from '../ui/ColorCircle';
import { sidebarStyles } from '../../styles/sidebarStyles';

const Select = dynamic(
  () => import("@baseline-ui/core").then((mod) => mod.Select),
  { ssr: false }
);

export const UserSelector: React.FC<UserSelectorProps> = ({
  users,
  currentUser,
  onUserChange
}) => {
  return (
    <div style={sidebarStyles.section}>
      <h3 style={sidebarStyles.sectionTitle}>
        user
      </h3>
      <div style={sidebarStyles.sectionDescription}>
        Choose &apos;Admin&apos; to edit and prepare the document for signing, or select a user to sign the document as that user.
      </div>
      <Select
        items={users.map((user) => ({
          id: user.id.toString(),
          label: user?.name.length > 15 ? user?.name.slice(0, 15) + "..." : user?.name,
          icon: () => user.role === "Editor" ? null : (
            <ColorCircle color={user.color?.toString()} />
          ),
        }))}
        className="input-custom-style"
        selectedKey={currentUser.id.toString()}
        onSelectionChange={(selected: any) => {
          const selectedUser = users.find((user) => user.id == selected) as User;
          onUserChange(selectedUser);
        }}
      />
    </div>
  );
};