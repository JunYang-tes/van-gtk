
import Gtk from 'gi://Gtk?version=4.0';
import * as ex from './ex'

type MimicDom<T extends Gtk.Widget> = T & {
  _name: string,
  nodeType: number,
  append: (widget: Gtk.Widget | string | number | boolean) => void
  replaceWith: (widget: Gtk.Widget) => void
  remove: () => void
  setAttribute: (name: string, value: any) => void
  removeEventListener: (event: string, callback: any) => void
  addEventListener: (event: string, callback: any) => void
  isConnected: boolean
}

(globalThis as any).Text = function Text(text: any) {
  if (text == null) {
    return null
  }
  const label = new Gtk.Label({ label: String(text) })
  return wrapWidget(label, "Label")
}

const parentCache = ex.weakCache()
function replaceWith(box: Gtk.Widget,
  newWidget: Gtk.Widget, oldWidget: Gtk.Widget
) {
  let child = box.get_first_child()
  let prev = child
  while (child != null && child !== oldWidget) {
    prev = child
    child = child.get_next_sibling();
  }

  newWidget.insert_after(box, prev)
  oldWidget.unparent();
}

function singleChildContainerReplaceWith<T extends { child: Gtk.Widget }>(container: T, newWidget: Gtk.Widget, oldWidget: Gtk.Widget) {
  oldWidget.unparent();
  container.child = newWidget
}


const replace = {
  'Box': replaceWith,
  'ListBox': replaceWith,
  'ListBoxRow': singleChildContainerReplaceWith<Gtk.ListBoxRow>,
  'ScrolledWindow': singleChildContainerReplaceWith<Gtk.ScrolledWindow>,
  'Window': singleChildContainerReplaceWith<Gtk.Window>,
  'Revealer': singleChildContainerReplaceWith<Gtk.Revealer>,
  'StackPage': singleChildContainerReplaceWith<Gtk.StackPage>,
  'Stack': replaceWith,
  'FlowBox': replaceWith,
  'Fixed': replaceWith,
  'Popover': replaceWith
}
function singleChildContainerAppend<T extends { child: Gtk.Widget }>(container: T, child: Gtk.Widget) {
  container.child = child
}
const appendFns = {
  'ListBoxRow': singleChildContainerAppend<Gtk.ListBoxRow>,
  'ScrolledWindow': singleChildContainerAppend<Gtk.ScrolledWindow>,
  'Window': singleChildContainerAppend<Gtk.Window>,
  'Revealer': singleChildContainerAppend<Gtk.Revealer>,
  'StackPage': singleChildContainerAppend<Gtk.StackPage>,
  'Stack': (container: Gtk.Stack, child: Gtk.Widget) => {
    const _stackMeta = ex.get(child) as { name: string, title?: string }
    if (_stackMeta.title) {
      container.add_titled(child, _stackMeta.name, _stackMeta.title)
    } else {
      container.add_named(child, _stackMeta.name)
    }
  },
  'Notebook': (container: Gtk.Notebook, child: Gtk.Widget) => {
    const title = ex.get(child)
    if (title) {
      container.append_page(child, title)
    }
    //TODO: error
  },
  'Fixed': (container: Gtk.Fixed, child: Gtk.Widget) => {
    const { x, y } = ex.get(child) ?? { x: 0, y: 0 }
    container.put(child, x, y)
  },
  'PopoverMenu': (container: Gtk.PopoverMenu, child: Gtk.Widget) => {
    const id = ex.get(child)
    container.add_child(child, id)
  },
  'Grid': (container: Gtk.Grid, child: Gtk.Widget) => {
    const { row, col, rowSpan, colSpan } = ex.get(child) ?? { row: 0, col: 0, rowSpan: 1, colSpan: 1 }
    container.attach(child, col, row, colSpan, rowSpan)
  }
}

function wrapWidget<T extends Gtk.Widget>(
  widget: T,
  name: string
): MimicDom<T> {
  const listeners = new WeakMap();
  const append = (widget as any).append as (null | ((child: Gtk.Widget) => void))
  const w: MimicDom<T> = widget as any
  w._name = name;
  w.nodeType = 1
  w.remove = function () {
    const cb = ex.widgetsRemoveCallback.get(widget)
    widget.unparent();
    if (cb) {
      cb()
    }
  }
  w.replaceWith = function (newWidget: Gtk.Widget) {
    /*
     * Some widgets (for example ScrolledWindow) will added
     * a special widget as it's real child, (Viewport for ScrolledWindow)
     * */
    const parent =
      parentCache.get(widget)
    const r = replace[parent._name as keyof typeof replace]
    if (r) {
      r(parent as any, newWidget, widget)
      parentCache.put(newWidget, parent)
      const cb = ex.widgetsRemoveCallback.get(widget)
      cb?.()
    } else {
      console.warn("no replace function for:", parent)
    }
  }
  w.setAttribute = function (name: string, value: any) {
    try {
      (widget as any)[`set_${name}`](value)
    } catch (e) {
      console.error(e)
    }
  }
  w.append = function (child: Gtk.Widget | string | number | boolean) {
    if (append == null && appendFns[name as keyof typeof appendFns] == null) return
    const childWidget = typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean'
      ? new Gtk.Label({ label: String(child) }) : child
    if (append) {
      append.call(widget, childWidget)
    } else {
      appendFns[name as keyof typeof appendFns]?.(widget, childWidget)
    }
    parentCache.put(childWidget, widget)
  }
  w.addEventListener =
    function (event: string, callback: any) {
      const id = widget.connect(event, callback)
      listeners.set(callback, id)
    };
  w.removeEventListener =
    function (event: string, callback: any) {
      if (callback) {
        widget.disconnect(listeners.get(callback))
      }
    };
  Object.defineProperty(w, 'isConnected', {
    get: function () {
      return w.parent != null
    }
  })
  return w
}


(globalThis as any).document = {
  nodeType: 1,
  createElement: function (
    tagName: string) {
    const widget = new (Gtk as any)[tagName]({})
    return wrapWidget(widget, tagName)
  }
}
