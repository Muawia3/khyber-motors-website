import React from 'react';
import { User, ChevronDown, Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import { Container } from '../common/Container';
import { SectionHeading } from '../common/SectionHeading';

import { getFileUrl } from '../../utils/urlHelper';

const LEVEL_STYLES = [
  // Level 0 (Top Executive / GM)
  {
    cardMax: 'max-w-sm',
    padding: 'p-5 sm:p-6',
    imgSize: 'w-16 h-16 sm:w-18 sm:h-18',
    iconSize: 'w-8 h-8',
    nameText: 'text-base sm:text-xl font-extrabold',
    badgeText: 'text-xs font-bold px-3 py-1',
    descText: 'text-xs leading-relaxed',
  },
  // Level 1 (Department Managers: Sales Manager / Services Manager)
  {
    cardMax: 'max-w-[300px]',
    padding: 'p-4 sm:p-4.5',
    imgSize: 'w-13 h-13 sm:w-14 sm:h-14',
    iconSize: 'w-6 h-6',
    nameText: 'text-sm sm:text-base font-extrabold',
    badgeText: 'text-[11px] font-bold px-2.5 py-0.5',
    descText: 'text-[11px] leading-relaxed',
  },
  // Level 2 (Advisors / Executives)
  {
    cardMax: 'max-w-[270px]',
    padding: 'p-3.5 sm:p-4',
    imgSize: 'w-11 h-11 sm:w-12 sm:h-12',
    iconSize: 'w-5 h-5',
    nameText: 'text-xs sm:text-sm font-bold',
    badgeText: 'text-[10px] font-bold px-2 py-0.5',
    descText: 'text-[10px] leading-snug',
  },
  // Level 3+ (Team Members / Specialists)
  {
    cardMax: 'max-w-[240px]',
    padding: 'p-3 sm:p-3.5',
    imgSize: 'w-9.5 h-9.5 sm:w-10 sm:h-10',
    iconSize: 'w-4 h-4',
    nameText: 'text-xs font-bold',
    badgeText: 'text-[9px] font-bold px-1.5 py-0.5',
    descText: 'text-[10px] line-clamp-2',
  },
];

function getLevelStyle(level) {
  const index = Math.min(level, LEVEL_STYLES.length - 1);
  return LEVEL_STYLES[index];
}

export const ProfileCard = ({
  member,
  parentName,
  level = 0,
  isAdmin = false,
  onAddSubordinate,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const style = getLevelStyle(level);

  return (
    <div
      className={`bg-white border rounded-sm ${style.padding} shadow-sm hover:shadow-md transition-all duration-300 space-y-3 relative z-10 w-full ${style.cardMax} mx-auto text-left group ${
        isAdmin && !member.isActive
          ? 'border-dashed border-gray-300 bg-gray-50/70 opacity-75'
          : 'border-gray-200 hover:border-[#C8102E]'
      }`}
    >
      {/* Top Accent Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 rounded-t-sm transition-colors ${
          member.isActive ? 'bg-[#C8102E] group-hover:bg-[#A80C24]' : 'bg-gray-400'
        }`}
      />

      {/* Header: Photo + Info */}
      <div className="flex items-start gap-3 sm:gap-4 pt-1">
        {member.imageUrl ? (
          <img
            src={getFileUrl(member.imageUrl)}
            alt={member.name}
            className={`${style.imgSize} rounded-full object-cover border-2 border-gray-200 group-hover:border-[#C8102E] shrink-0 shadow-xs transition-colors`}
          />
        ) : (
          <div
            className={`${style.imgSize} rounded-full bg-gray-100 text-[#C8102E] flex items-center justify-center shrink-0 border-2 border-gray-200 group-hover:border-[#C8102E] transition-colors`}
          >
            <User className={style.iconSize} />
          </div>
        )}

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h4 className={`${style.nameText} text-gray-900 tracking-tight leading-snug truncate`}>
              {member.name}
            </h4>
            {isAdmin && (
              <span
                onClick={() => onToggleActive && onToggleActive(member.id)}
                className={`cursor-pointer px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-xs border shrink-0 ${
                  member.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-gray-100 text-gray-600 border-gray-300'
                }`}
              >
                {member.isActive ? 'Active' : 'Hidden'}
              </span>
            )}
          </div>

          <div
            className={`inline-block bg-[#C8102E]/10 border border-[#C8102E]/20 text-[#C8102E] ${style.badgeText} uppercase tracking-wider rounded-xs truncate max-w-full`}
          >
            {member.designation}
          </div>
        </div>
      </div>

      {/* Parent Label (Admin view) */}
      {isAdmin && parentName && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-xs border border-gray-200">
            <Layers className="w-2.5 h-2.5 text-gray-400" />
            Reports to: {parentName}
          </span>
        </div>
      )}

      {/* Short Description */}
      {member.shortDescription && (
        <p className={`${style.descText} text-gray-600 pt-1 border-t border-gray-100`}>
          {member.shortDescription}
        </p>
      )}

      {/* Admin Visual Action Buttons */}
      {isAdmin && (
        <div className="pt-2.5 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => onAddSubordinate && onAddSubordinate(member)}
            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C8102E] hover:text-[#A80C24] bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-xs border border-red-200 transition-colors cursor-pointer"
            title="Add Subordinate under this profile"
          >
            <Plus className="w-3 h-3" />
            <span>Add Child</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit && onEdit(member)}
              className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xs transition-colors cursor-pointer"
              title="Edit Profile"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete && onDelete(member)}
              className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
              title="Delete Profile"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Recursive Hierarchy Node:
// Level 0 -> Level 1 (GM to Sales Manager & Service Manager): Horizontal Side-by-Side
// Level >= 1 (Sales Execs, Service Advisors, Subordinates): Vertical Stacked Column
export const TreeNode = ({
  node,
  memberMap,
  level = 0,
  isAdmin = false,
  onAddSubordinate,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const children = node.children || [];
  const parentName = node.parentId ? memberMap.get(node.parentId)?.name : null;
  const isTopLevelTransition = level === 0;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Node Profile Card */}
      <ProfileCard
        member={node}
        parentName={parentName}
        level={level}
        isAdmin={isAdmin}
        onAddSubordinate={onAddSubordinate}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
      />

      {/* Children Container */}
      {children.length > 0 && (
        <div className="flex flex-col items-center w-full my-2">
          {/* Vertical Stem Line from parent card */}
          <div className="w-0.5 h-6 bg-gray-300" />

          {/* Downward Arrow Icon */}
          <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300 text-gray-500 flex items-center justify-center -mt-1 shadow-2xs z-10">
            <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
          </div>

          {/* Subordinate Children Layout */}
          <div className="w-full pt-4">
            {isTopLevelTransition && children.length > 1 ? (
              /* Level 0 -> Level 1: Horizontal Side-by-Side Split for Department Heads (Sales Manager & Service Manager) */
              <div className="relative w-full">
                <div className="hidden sm:flex justify-between items-start w-full gap-8">
                  {children.map((child, index) => {
                    const isFirst = index === 0;
                    const isLast = index === children.length - 1;

                    return (
                      <div
                        key={child.id}
                        className="relative flex flex-col items-center flex-1 min-w-[280px]"
                      >
                        {/* Horizontal Line spanning between department heads */}
                        <div
                          className={`hidden sm:block absolute top-0 h-0.5 bg-gray-300 ${
                            isFirst
                              ? 'left-1/2 right-0'
                              : isLast
                              ? 'left-0 right-1/2'
                              : 'left-0 right-0'
                          }`}
                        />
                        {/* Vertical Stem to Department Head Card */}
                        <div className="hidden sm:block absolute top-0 w-0.5 h-4 bg-gray-300" />

                        {/* Department Head Branch */}
                        <div className="pt-4 w-full">
                          <TreeNode
                            node={child}
                            memberMap={memberMap}
                            level={level + 1}
                            isAdmin={isAdmin}
                            onAddSubordinate={onAddSubordinate}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onToggleActive={onToggleActive}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Fallback for Level 1 */}
                <div className="sm:hidden flex flex-col items-center space-y-6 w-full">
                  {children.map((child) => (
                    <div key={child.id} className="w-full flex flex-col items-center">
                      <TreeNode
                        node={child}
                        memberMap={memberMap}
                        level={level + 1}
                        isAdmin={isAdmin}
                        onAddSubordinate={onAddSubordinate}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggleActive={onToggleActive}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Level >= 1: Flex-Wrap Grid Layout for Team Members (fills available left & right space dynamically) */
              <div className="flex flex-wrap justify-center items-start gap-6 sm:gap-8 w-full max-w-5xl mx-auto">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="flex flex-col items-center min-w-[220px] max-w-[300px] flex-1"
                  >
                    <TreeNode
                      node={child}
                      memberMap={memberMap}
                      level={level + 1}
                      isAdmin={isAdmin}
                      onAddSubordinate={onAddSubordinate}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onToggleActive={onToggleActive}
                    />
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export const TeamHierarchy = ({
  teamMembers = [],
  hideHeader = false,
  isAdmin = false,
  onAddSubordinate,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  if (!teamMembers || teamMembers.length === 0) {
    return null;
  }

  // Create member lookup map
  const memberMap = new Map(teamMembers.map((m) => [m.id, { ...m, children: [] }]));

  // Build tree hierarchy dynamically based on parentId
  const rootNodes = [];
  teamMembers.forEach((member) => {
    const node = memberMap.get(member.id);
    if (member.parentId && memberMap.has(member.parentId)) {
      memberMap.get(member.parentId).children.push(node);
    } else {
      rootNodes.push(node);
    }
  });

  // Sort children by displayOrder at each level
  memberMap.forEach((node) => {
    if (node.children && node.children.length > 0) {
      node.children.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    }
  });
  rootNodes.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return (
    <section id="our-team" className={hideHeader ? 'w-full' : 'bg-gray-50 py-16 sm:py-24 border-y border-gray-200'}>
      <Container size="xl" className="space-y-12">
        {!hideHeader && (
          <SectionHeading
            badge="Leadership & Expertise"
            title="Our Team"
            subtitle="Meet the dedicated leadership, sales consultants, and after-sales service team powering Khyber Motors."
            align="center"
          />
        )}

        <div className="space-y-16 w-full max-w-7xl mx-auto overflow-x-auto pb-8">
          {rootNodes.map((rootNode) => (
            <TreeNode
              key={rootNode.id}
              node={rootNode}
              memberMap={memberMap}
              isAdmin={isAdmin}
              onAddSubordinate={onAddSubordinate}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};

export default TeamHierarchy;
