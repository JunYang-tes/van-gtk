import Gtk from '@girs/gtk-4.0'
import { OverloadUnionRecursive, UnionToIntersection } from './types'
export interface State<T> {
  val: T
  readonly oldVal: T
  readonly rawVal: T
}
type Element = Gtk.Widget
type Node = Gtk.Widget
export type ContainerMap = {
  Box: Gtk.Box,
  ScrolledWindow: Gtk.ScrolledWindow,
  Grid: Gtk.Grid,
  ListBox: Gtk.ListBox,
  ListBoxRow: Gtk.ListBoxRow,
  Revealer: Gtk.Revealer,
  Stack: Gtk.Stack,
  StackSwitcher: Gtk.StackSidebar,
  StackSidebar: Gtk.StackSidebar,
  StackPage: Gtk.StackPage
  FlowBox: Gtk.FlowBox,
  Fixed: Gtk.Fixed,
  Notebook: Gtk.Notebook,
  Overlay: Gtk.Overlay,
  PopoverMenu: Gtk.PopoverMenu
  Window:Gtk.Window,
}
export type ContainerCtorProps = {
  Box: Gtk.Box.ConstructorProps,
  ScrolledWindow: Gtk.ScrolledWindow.ConstructorProps,
  Grid: Gtk.Grid.ConstructorProps,
  ListBox: Gtk.ListBox.ConstructorProps,
  ListBoxRow: Gtk.ListBoxRow.ConstructorProps,
  Revealer: Gtk.Revealer.ConstructorProps,
  Stack: Gtk.Stack.ConstructorProps,
  StackSwitcher: Gtk.StackSidebar.ConstructorProps,
  StackSidebar: Gtk.StackSidebar.ConstructorProps,
  StackPage: Gtk.StackPage.ConstructorProps
  FlowBox: Gtk.FlowBox.ConstructorProps,
  Fixed: Gtk.Fixed.ConstructorProps,
  DrawingArea: Gtk.DrawingArea.ConstructorProps & {
    draw_func: Gtk.DrawingAreaDrawFunc
  },
  Notebook: Gtk.Notebook.ConstructorProps,
  Spinner: Gtk.Spinner.ConstructorProps,
  Overlay: Gtk.Overlay.ConstructorProps,
  PopoverMenu: Gtk.PopoverMenu.ConstructorProps,
  Window:Gtk.Window.ConstructorProps
}
export type AtomWidgetMap = {
  Button: Gtk.Button,
  ToggleButton: Gtk.ToggleButton,
  CheckButton: Gtk.CheckButton,
  Label: Gtk.Label,
  Spinner: Gtk.Spinner,
  ProgressBar: Gtk.ProgressBar
  Entry: Gtk.Entry,
  Switch: Gtk.Switch,
  Scale: Gtk.Scale,
  DrawingArea: Gtk.DrawingArea,
  LevelBar: Gtk.LevelBar,
  Picture: Gtk.Picture,
  DropDown: Gtk.DropDown,
  TextView: Gtk.TextView
}
export type AtomWidgetsProps = {
  Button: Gtk.Button.ConstructorProps,
  ToggleButton: Gtk.ToggleButton.ConstructorProps,
  CheckButton: Gtk.CheckButton.ConstructorProps,
  Label: Gtk.Label.ConstructorProps,
  Spinner: Gtk.Spinner.ConstructorProps,
  ProgressBar: Gtk.ProgressBar.ConstructorProps
  Entry: Gtk.Entry.ConstructorProps,
  Switch: Gtk.Switch.ConstructorProps,
  Scale: Gtk.Scale.ConstructorProps,
  DrawingArea: Gtk.DrawingArea.ConstructorProps,
  LevelBar: Gtk.LevelBar.ConstructorProps,
  Picture: Gtk.Picture.ConstructorProps & { filename?: string },
  DropDown: Gtk.DropDown.ConstructorProps,
  TextView: Gtk.TextView.ConstructorProps,
}

type GetSetter<T extends { [k: string]: any }> = {
  [K in keyof T as K extends `set_${infer Rest}` ? Rest : never]: T[K]
}
type SetterNotify<T extends Record<string, any>> = {
  [K in keyof T as
  K extends string ? `onnotify::${K}` : never]?: (s: T) => void
}

/**
 * (string,callback) | ('clicked',callback) | ('actived',callback)
 * to 
 * ('clicked',callback) | ('actived',callback)
 * */
type RemoveStringEventName<E> = E extends [infer A, infer B]
  ? string extends A
  ? never
  : [A, B]
  : never

type Events<T extends ((...args: any[]) => any)> = UnionToIntersection<RemoveStringEventName<Parameters<OverloadUnionRecursive<T>>> extends [infer A, infer B]
  ? A extends string
  ? { [k in `on${A}`]?: B }
  : never
  : never>;

export type ReactiveProps<T> = {
  [K in keyof T]?: T[K] extends Gtk.Widget
  ? T[K] | (() => T[K])
  : T[K] | State<T[K]> | (() => T[K])
}
export type ContainerEventsMap = {
  [k in keyof ContainerMap]: Events<ContainerMap[k]["connect"]> & SetterNotify<ContainerMap[k]>
}
//type A = Events<Gtk.Editable['connect']>['onch']

export type ContainerReactivePropsMap = {
  [k in keyof ContainerCtorProps]: ReactiveProps<ContainerCtorProps[k]>// & Events<WidgetNameMap[k]["connect"]>
}

export type AtomWidgetReactivePropsMap = {
  [k in keyof AtomWidgetsProps]: ReactiveProps<AtomWidgetsProps[k]>
}
export type AtomWidgetEventsMap = {
  [k in keyof AtomWidgetMap]: Events<AtomWidgetMap[k]["connect"]> & SetterNotify<AtomWidgetMap[k]>
    & Events<Gtk.Widget['connect']>
} &
{
  'Entry': Events<Gtk.Entry['connect']> & {
    onchanged?: (i: Gtk.Entry) => void,
    'ondelete-text'?: (i: Gtk.Entry) => void,
    'oninsert-text'?: (i: Gtk.Entry) => void
  }
}
// Defining readonly view of State<T> for covariance.
// Basically we want StateView<string> to implement StateView<string | number>
export type StateView<T> = Readonly<State<T>>

export type Val<T> = State<T> | T

export type Primitive = string | number | boolean | bigint

export type PropValue = Primitive | ((e: any) => void) | null

export type PropValueOrDerived = PropValue | StateView<PropValue> | (() => PropValue)

export type Props = Record<string, PropValueOrDerived> & { class?: PropValueOrDerived }

export type PropsWithKnownKeys<ElementType> = Partial<{ [K in keyof ElementType]: PropValueOrDerived }>

export type ValidChildDomValue = Primitive | Node | null | undefined

export type BindingFunc = ((dom?: Node) => ValidChildDomValue) | ((dom?: Element) => Element)

export type ChildDom = ValidChildDomValue | StateView<Primitive | null | undefined> | BindingFunc | readonly ChildDom[]
export type SingleChildDom = ValidChildDomValue | StateView<Primitive | null | undefined> | BindingFunc

export type TagFunc<Result> = (first?: Props & ReactiveProps<Result> | ChildDom, ...rest: readonly ChildDom[]) => Result

export type Tags = {
  [K in keyof ContainerMap]: (first?: (ContainerReactivePropsMap[K] & ContainerEventsMap[K]) | ChildDom, ...rest: readonly ChildDom[]) => ContainerMap[K]
}
export type AtomWidget = {
  [K in keyof AtomWidgetMap]: (first?: AtomWidgetReactivePropsMap[K] & AtomWidgetEventsMap[K]) => AtomWidgetMap[K]
}

declare function state<T>(): State<T>
declare function state<T>(initVal: T): State<T>

export interface Van {
  readonly state: typeof state
  readonly derive: <T>(f: () => T) => State<T>
  readonly add: (dom: Element, ...children: readonly ChildDom[]) => Element
  readonly tags: Tags & ((namespaceURI: string) => Readonly<Record<string, TagFunc<Element>>>)
  readonly hydrate: <T extends Node>(dom: T, f: (dom: T) => T | null | undefined) => T
}

declare const van: Van

export default van
