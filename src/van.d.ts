import Gtk from '@girs/gtk-4.0'
import { OverloadUnionRecursive, UnionToIntersection } from './types'
export interface State<T> {
  val: T
  readonly oldVal: T
  readonly rawVal: T
}
type Element = Gtk.Widget
type Node = Gtk.Widget
export type WidgetNameMap = {
  Button: Gtk.Button,
  Label: Gtk.Label,
  Box: Gtk.Box,
  Entry: Gtk.Entry,
  ScrolledWindow: Gtk.ScrolledWindow,
  Grid: Gtk.Grid,
  ListBox: Gtk.ListBox,
  ListBoxRow: Gtk.ListBoxRow,
  Revealer: Gtk.Revealer,
  Stack: Gtk.Stack,
  StackSwitcher: Gtk.StackSidebar,
  StackSidebar: Gtk.StackSidebar,
  StackPage: Gtk.StackPage
  Switch: Gtk.Switch,
  Scale: Gtk.Scale,
  FlowBox: Gtk.FlowBox,
  Fixed: Gtk.Fixed,
  DrawingArea: Gtk.DrawingArea,
  Notebook: Gtk.Notebook,
  Spinner: Gtk.Spinner,
  Overlay: Gtk.Overlay
}
export type WidgetCtorProps = {
  Button: Gtk.Button.ConstructorProps,
  Label: Gtk.Label.ConstructorProps,
  Box: Gtk.Box.ConstructorProps,
  Entry: Gtk.Entry.ConstructorProps,
  ScrolledWindow: Gtk.ScrolledWindow.ConstructorProps,
  Grid: Gtk.Grid.ConstructorProps,
  ListBox: Gtk.ListBox.ConstructorProps,
  ListBoxRow: Gtk.ListBoxRow.ConstructorProps,
  Revealer: Gtk.Revealer.ConstructorProps,
  Stack: Gtk.Stack.ConstructorProps,
  StackSwitcher: Gtk.StackSidebar.ConstructorProps,
  StackSidebar: Gtk.StackSidebar.ConstructorProps,
  StackPage: Gtk.StackPage.ConstructorProps
  Switch: Gtk.Switch.ConstructorProps,
  Scale: Gtk.Scale.ConstructorProps,
  FlowBox: Gtk.FlowBox.ConstructorProps,
  Fixed: Gtk.Fixed.ConstructorProps,
  DrawingArea: Gtk.DrawingArea.ConstructorProps & {
    draw_func: Gtk.DrawingAreaDrawFunc
  },
  Notebook: Gtk.Notebook.ConstructorProps,
  Spinner: Gtk.Spinner.ConstructorProps,
  Overlay: Gtk.Overlay.ConstructorProps
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
export type WidgetEventsMap = {
  [k in keyof WidgetNameMap]: Events<WidgetNameMap[k]["connect"]>
} & {
  'Entry': Events<Gtk.Entry['connect']> & {
    onchanged?: (i: Gtk.Entry) => void,
    'ondelete-text'?: (i: Gtk.Entry) => void,
    'oninsert-text'?: (i: Gtk.Entry) => void
  }
}
//type A = Events<Gtk.Editable['connect']>['onch']

export type WidgetReactiveProps = {
  [k in keyof WidgetCtorProps]: ReactiveProps<WidgetCtorProps[k]>// & Events<WidgetNameMap[k]["connect"]>
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
  [K in keyof WidgetNameMap]: (first?: (WidgetReactiveProps[K] & WidgetEventsMap[K]) | ChildDom, ...rest: readonly ChildDom[]) => WidgetNameMap[K]
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
