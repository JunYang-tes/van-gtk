import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib?version=2.0';
import {
  app, Button, Box,
  StackSwitcher,
  Stack,
  StackPage,
  Label, Entry, van, ListBoxRow, ListBox, ScrolledWindow, Revealer,
  StackSidebar
} from '../../src/'

const count = van.state(0)
const BasicWidgets = () => {
  const input = van.state("")
  const expanded = van.state(false)
  return Box(
    {
      orientation: Gtk.Orientation.VERTICAL,
      vexpand: true
    },
    Label({ label: () => `Input:${input.val}` }),
    Entry({
      text: input,
      onchanged: (i: Gtk.Entry) => {
        input.val = i.text
      }
    }),
    ScrolledWindow(
      { vexpand: true },
      ListBox(
        ListBoxRow(Label({ label: "Row1" })),
        ListBoxRow(Label({ label: "Row2" })),
        ListBoxRow(() => `Input length ${input.val.length}`),
        ListBoxRow(Box(
          { orientation: Gtk.Orientation.VERTICAL },
          Label({ label: "Row4" }),
          Button({ label: () => expanded.val ? 'Hide' : 'Show', onclicked: () => expanded.val = !expanded.val }),
          Revealer({
            revealChild: expanded,
          },
            Label({ label: "Hello,world" })
          )
        ))
      )
    )
  )
}

const StackDemo = () => {
  const title = van.state("Page1")
  const transitionType = [
    Gtk.StackTransitionType.SLIDE_LEFT_RIGHT,
    Gtk.StackTransitionType.OVER_UP,
    Gtk.StackTransitionType.OVER_DOWN,
    Gtk.StackTransitionType.SLIDE_UP,
    Gtk.StackTransitionType.SLIDE_DOWN,
    Gtk.StackTransitionType.CROSSFADE
  ]
  const transitionTypeName = [
    'SLIDE_LEFT_RIGHT', 'OVER_UP', 'OVER_DOWN', 'SLIDE_UP', 'SLIDE_DOWN',
    'CROSSFADE'
  ]
  const selected = van.state(0)
  const TransitionType = () => {
    return Button({
      label: () => `Cycle Transition Type (${transitionTypeName[selected.val]})`,
      onclicked: () => {
        selected.val = (selected.val + 1) % transitionType.length
      }
    })
  }



  const stackSwitcher = StackSwitcher()
  const p1 = StackPage({ name: "page1", title: title },
    Box(
      { orientation: Gtk.Orientation.VERTICAL },
      Label({ label: "P1" }),
      Button({
        label: "Click to update Switcher title randomly",
        onclicked: () => {
          title.val = "Page1 " + Math.random()
        }
      }),
      TransitionType()
    )
  );
  const stack = Stack({
    transitionType: () => transitionType[selected.val],
    transitionDuration: 1000,
  },
    p1,
    StackPage({ name: "page2", title: "Page2" },
      Box(
        { orientation: Gtk.Orientation.VERTICAL },
        Label({ label: "P2" }),
        TransitionType()
      )
    )
  )
  stackSwitcher.set_stack(stack)
  return Box(
    { orientation: Gtk.Orientation.VERTICAL },
    //StackSwitcher({stack:stack},'a'),
    stackSwitcher,
    stack
  )
}

app(
  () => {
    const side = StackSidebar()
    const stack = Stack(
      StackPage({ name: "page1", title: "Basic Widgets" },
        BasicWidgets()
      ),
      StackPage({ name: "page2", title: "Stack Demo" },
        StackDemo()
      ),
    )
    side.set_stack(stack);
    const win = new Gtk.Window({
      child: Box(
        side,
        stack
      )
    })
    return win;
  })
  .exitOnClose()
  .run()
