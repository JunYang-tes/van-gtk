import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib?version=2.0';
import {
  app, Button, Box,
  StackSwitcher,
  Stack,
  StackPage,
  Switch,
  Notebook,
  NotebookItem,
  Label, Entry, van, ListBoxRow, ListBox, ScrolledWindow, Revealer,
  Overlay,
  Scale,
  FlowBox,
  Fixed,
  FixedItem,
  VFLContainer,
  StackSidebar,
  DrawingArea,
  Spinner,
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
      onchanged: (i) => {
        input.val = i.text
      }
    }),
    Scale(
      { adjustment: new Gtk.Adjustment({ lower: 0, upper: 100, step_increment: 1 }) }
    ),
    Switch({ hexpand: false }),
    "List:",
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
    ),
    "Spinner",
    Spinner({
      spinning: expanded
    })
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

const NotebookDemo = () => {
  const c = van.state(0)
  return Notebook(
    NotebookItem(
      Label({ label: () => `Tab1: ${c.val}` }),
      Box(
        { orientation: Gtk.Orientation.VERTICAL },
        Label({ label: "P1" }),
        Button({
          label: "Update title",
          onclicked: () => {
            c.val = c.val + 1
          }
        })
      )
    ),
    NotebookItem(
      "Tab2",
      Box(
        { orientation: Gtk.Orientation.VERTICAL },
        Label({ label: "P2" }),
        Button({
          label: "Update title",
          onclicked: () => {
            c.val = c.val + 1
          }
        })
      )
    )
  )
}

const VFLDemo = () => {
  //https://blog.gtk.org/2019/07/02/constraint-layouts/
  const layouts = [
    [
      "H:|-[button3]-|",
      "H:|-[button1(==button2)]-12-[button2]-|",
      "V:|-[button3]-12-[button1(==button3)]-|",
      "V:|-[button3]-12-[button2(==button3)]-|",
    ],
    [
      "H:|-[button1(==button2)]-12-[button2]-|",
      "H:|-[button3]-|",
      "V:|-[button1]-12-[button3(==button1)]-|",
      "V:|-[button2]-12-[button3(==button2)]-|",
    ],
  ]
  const vfl = van.state(layouts[0])
  return VFLContainer({
    vfl: vfl
  },
    Button({
      name: "button1", label: "Click to cycle layout", onclicked: () => {
        vfl.val = vfl.val === layouts[0] ? layouts[1] : layouts[0]
      }
    }),
    // child can be reactive like this 
    () => vfl.val === layouts[0]
      ? Button({ name: "button2", label: "button2" })
      : Label({ name: "button2", label: "label2" }),
    //Button({ name: "button2", label: "button2" }),
    Button({ name: "button3", label: "button3" })
  )
}


const Containers = () => {
  const x = van.state(0)
  return Notebook(
    NotebookItem(
      "Flow",
      Box(
        { orientation: Gtk.Orientation.VERTICAL },
        FlowBox(
          new Array(10)
            .fill(0)
            .map(() => Button({ label: "FlowBox" }))
        )
      )
    ),
    NotebookItem(
      "Fixed",
      Box(
        { orientation: Gtk.Orientation.VERTICAL },
        Fixed(
          FixedItem({ x: x, y: 100 },
            Button({
              label: "Move right",
              onclicked: () => {
                x.val += 10;
              }
            }))
        )
      )
    ),
    NotebookItem(
      "Overlay",
      Box(
        Overlay(
          Entry(),
          Box(
            Button({ label: "Button" }),
            Button({ label: "Button" }),
            Button({ label: "Button" })
          )
        )
      )
    ),
    NotebookItem(
      "Grid",
      Box(
        { orientation: Gtk.Orientation.VERTICAL },
        Label({ label: "Grid" })
      )
    ),
    NotebookItem(
      "ConstraintLayout(VFL)"
      , VFLDemo()
    )
  )
}

const Drawing = () => {
  const points: [number, number][] = [
  ]
  let drawing = false
  const drawingArea = DrawingArea(
    {
      hexpand: true,
      vexpand: true,
      //gesture: g,
      draw_func: () => (area, cr, w, h) => {
        //https://github.com/gjsify/ts-for-gir/issues/194
        cr.setSourceRGB(0, 0, 0);
        cr.setLineWidth(2);
        if (points.length < 2) return
        const [first, ...rest] = points
        cr.moveTo(first[0], first[1])
        for (const [x, y] of rest) {
          cr.lineTo(x, y)
        }
        cr.stroke();
      }
    }
  ) as Gtk.DrawingArea;
  const click = new Gtk.GestureClick()
  click.connect("pressed", (_, _1, x, y) => {
    points.splice(0, points.length)
    drawing = true
  })
  click.connect("released", () => {
    drawing = false
  })
  const move = new Gtk.EventControllerMotion()
  move.connect("motion", (_, x, y) => {
    if (drawing) {
      points.push([x, y])
      drawingArea.queue_draw();
    }
  })
  drawingArea.add_controller(click)
  drawingArea.add_controller(move)
  return drawingArea
}

app(
  () => {
    const side = StackSidebar()
    const stack = Stack(
      { hexpand: true },
      StackPage({ name: "page1", title: "Basic Widgets" },
        BasicWidgets()),
      StackPage({ name: "page2", title: "Stack Demo" },
        StackDemo()
      ),
      StackPage(
        { name: "NotebookDemo", title: "NotebookDemo" },
        NotebookDemo()
      ),
      StackPage({ name: "Containers", title: "Containers" },
        Containers()
      ),
      StackPage({ name: "Drawing", title: "Drawing" },
        Drawing()
      )
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
