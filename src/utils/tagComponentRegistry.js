
import { TAGS, getTagByName } from './tags.js';

export function getComponentForTag(tagName) {
  const tag = getTagByName(tagName);
  return tag ? tag.component : null;
}

export function hasComponent(tagName) {
  return !!getComponentForTag(tagName);
}

export function getTagComponents(parsed) {
  if (!parsed || !parsed.tags) return [];
  const components = [];
  for (const [tag, value] of Object.entries(parsed.tags)) {
    const tagDef = getTagByName(tag);
    if (!tagDef) continue;
    components.push({
      tag,
      component: tagDef.component,
      value,
      group: false
    });
  }
  return components;
}
