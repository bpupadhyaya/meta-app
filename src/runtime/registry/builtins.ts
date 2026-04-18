import { ComponentRegistry } from './ComponentRegistry';
import { MetaText } from '../../components/primitives/MetaText';
import { MetaButton } from '../../components/primitives/MetaButton';
import { MetaImage } from '../../components/primitives/MetaImage';
import { MetaInput } from '../../components/primitives/MetaInput';
import { MetaSwitch } from '../../components/primitives/MetaSwitch';
import { MetaView } from '../../components/layout/MetaView';
import { MetaScrollView } from '../../components/layout/MetaScrollView';
import { MetaCard } from '../../components/layout/MetaCard';
import { MetaSpacer } from '../../components/layout/MetaSpacer';
import { MetaCheckbox } from '../../components/forms/MetaCheckbox';

export function registerBuiltinComponents(): void {
  ComponentRegistry.register('text', {
    component: MetaText,
    displayName: 'Text',
    category: 'primitive',
    icon: 'text',
    defaultProps: { text: 'Text', variant: 'body' },
    editableProps: [
      { name: 'text', type: 'string', label: 'Text', group: 'Content' },
      { name: 'variant', type: 'select', label: 'Variant', options: [
        { label: 'Body', value: 'body' },
        { label: 'Heading', value: 'heading' },
        { label: 'Caption', value: 'caption' },
        { label: 'Label', value: 'label' },
      ], group: 'Style' },
    ],
    acceptsChildren: false,
    events: ['onPress'],
  });

  ComponentRegistry.register('button', {
    component: MetaButton,
    displayName: 'Button',
    category: 'primitive',
    icon: 'button',
    defaultProps: { title: 'Button', variant: 'primary' },
    editableProps: [
      { name: 'title', type: 'string', label: 'Title', group: 'Content' },
      { name: 'variant', type: 'select', label: 'Variant', options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
        { label: 'Ghost', value: 'ghost' },
      ], group: 'Style' },
      { name: 'disabled', type: 'boolean', label: 'Disabled', group: 'State' },
    ],
    acceptsChildren: false,
    events: ['onPress'],
  });

  ComponentRegistry.register('image', {
    component: MetaImage,
    displayName: 'Image',
    category: 'primitive',
    icon: 'image',
    defaultProps: { width: 100, height: 100, resizeMode: 'cover' },
    editableProps: [
      { name: 'source', type: 'string', label: 'Source URL', group: 'Content' },
      { name: 'width', type: 'number', label: 'Width', group: 'Size' },
      { name: 'height', type: 'number', label: 'Height', group: 'Size' },
      { name: 'resizeMode', type: 'select', label: 'Resize Mode', options: [
        { label: 'Cover', value: 'cover' },
        { label: 'Contain', value: 'contain' },
        { label: 'Stretch', value: 'stretch' },
      ], group: 'Style' },
    ],
    acceptsChildren: false,
    events: ['onPress'],
  });

  ComponentRegistry.register('input', {
    component: MetaInput,
    displayName: 'Text Input',
    category: 'primitive',
    icon: 'input',
    defaultProps: { placeholder: 'Enter text...' },
    editableProps: [
      { name: 'placeholder', type: 'string', label: 'Placeholder', group: 'Content' },
      { name: 'multiline', type: 'boolean', label: 'Multiline', group: 'Behavior' },
      { name: 'secureTextEntry', type: 'boolean', label: 'Password', group: 'Behavior' },
      { name: 'keyboardType', type: 'select', label: 'Keyboard', options: [
        { label: 'Default', value: 'default' },
        { label: 'Email', value: 'email-address' },
        { label: 'Numeric', value: 'numeric' },
        { label: 'Phone', value: 'phone-pad' },
      ], group: 'Behavior' },
    ],
    acceptsChildren: false,
    events: ['onChange'],
  });

  ComponentRegistry.register('switch', {
    component: MetaSwitch,
    displayName: 'Switch',
    category: 'primitive',
    icon: 'switch',
    defaultProps: { value: false },
    editableProps: [
      { name: 'label', type: 'string', label: 'Label', group: 'Content' },
      { name: 'value', type: 'boolean', label: 'Value', group: 'State' },
    ],
    acceptsChildren: false,
    events: ['onChange'],
  });

  ComponentRegistry.register('view', {
    component: MetaView,
    displayName: 'View',
    category: 'layout',
    icon: 'view',
    defaultProps: {},
    editableProps: [],
    acceptsChildren: true,
    events: ['onPress'],
  });

  ComponentRegistry.register('scrollview', {
    component: MetaScrollView,
    displayName: 'Scroll View',
    category: 'layout',
    icon: 'scroll',
    defaultProps: { horizontal: false },
    editableProps: [
      { name: 'horizontal', type: 'boolean', label: 'Horizontal', group: 'Behavior' },
    ],
    acceptsChildren: true,
    events: [],
  });

  ComponentRegistry.register('card', {
    component: MetaCard,
    displayName: 'Card',
    category: 'layout',
    icon: 'card',
    defaultProps: { elevation: 2 },
    editableProps: [
      { name: 'elevation', type: 'number', label: 'Elevation', group: 'Style' },
    ],
    acceptsChildren: true,
    events: ['onPress'],
  });

  ComponentRegistry.register('spacer', {
    component: MetaSpacer,
    displayName: 'Spacer',
    category: 'layout',
    icon: 'spacer',
    defaultProps: { size: 16 },
    editableProps: [
      { name: 'size', type: 'number', label: 'Size', group: 'Style' },
      { name: 'horizontal', type: 'boolean', label: 'Horizontal', group: 'Behavior' },
    ],
    acceptsChildren: false,
    events: [],
  });

  ComponentRegistry.register('checkbox', {
    component: MetaCheckbox,
    displayName: 'Checkbox',
    category: 'form',
    icon: 'checkbox',
    defaultProps: { checked: false },
    editableProps: [
      { name: 'label', type: 'string', label: 'Label', group: 'Content' },
      { name: 'checked', type: 'boolean', label: 'Checked', group: 'State' },
    ],
    acceptsChildren: false,
    events: ['onChange'],
  });
}
