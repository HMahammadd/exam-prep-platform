export type AvatarConfig = {
  id: string;
  label: string;
  src: string;
};

export const AVATARS: AvatarConfig[] = [
  { id: "default", label: "Default", src: "/avatars/default.svg" },
  { id: "astronaut", label: "Astronaut", src: "/avatars/astronaut.svg" },
  { id: "robot", label: "Robot", src: "/avatars/robot.svg" },
  { id: "cat", label: "Cat", src: "/avatars/cat.svg" },
  { id: "dog", label: "Dog", src: "/avatars/dog.svg" },
  { id: "fox", label: "Fox", src: "/avatars/fox.svg" },
  { id: "owl", label: "Owl", src: "/avatars/owl.svg" },
  { id: "panda", label: "Panda", src: "/avatars/panda.svg" },
  { id: "star", label: "Star", src: "/avatars/star.svg" },
  { id: "planet", label: "Planet", src: "/avatars/planet.svg" },
];

export const DEFAULT_AVATAR_ID = "default";

export function getAvatarById(id: string | null | undefined): AvatarConfig {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}

export function isValidAvatarId(id: string): boolean {
  return AVATARS.some((a) => a.id === id);
}
